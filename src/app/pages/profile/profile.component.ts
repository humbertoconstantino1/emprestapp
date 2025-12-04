import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  personOutline,
  person,
  cameraOutline,
  camera,
  checkmarkOutline,
  lockClosedOutline,
  keyOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText,
  ],
})
export class ProfileComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  profilePhoto: string | null = null;

  // Senha
  senhaAtual: string = '';
  novaSenha: string = '';
  confirmarSenha: string = '';
  isSavingPassword: boolean = false;
  senhaError: string = '';
  senhaSuccess: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {
    addIcons({
      arrowBackOutline,
      personOutline,
      person,
      cameraOutline,
      camera,
      checkmarkOutline,
      lockClosedOutline,
      keyOutline,
      shieldCheckmarkOutline,
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.userName = user.name || 'Usuário';
        this.userEmail = user.email || '';
        this.profilePhoto = user.photo || null;
      },
      error: () => {
        const user = this.authService.getUser();
        this.userName = user?.name || 'Usuário';
        this.userEmail = user?.email || '';
      },
    });
  }

  selectPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Comprimir a imagem de forma inteligente
        this.compressImage(file, (compressedBase64: string) => {
          // Verifica o tamanho do base64 (aproximadamente 33% maior que o original)
          const base64Size = (compressedBase64.length * 3) / 4;
          const maxSize = 500 * 1024; // 500KB máximo

          if (base64Size > maxSize) {
            // Se ainda for muito grande, comprime mais agressivamente
            this.compressImageAggressively(file, (moreCompressed: string) => {
              this.profilePhoto = moreCompressed;
              this.savePhoto(moreCompressed);
            });
          } else {
            this.profilePhoto = compressedBase64;
            this.savePhoto(compressedBase64);
          }
        });
      }
    };

    input.click();
  }

  private compressImage(file: File, callback: (base64: string) => void) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Tamanho otimizado para foto de perfil (400x400 é suficiente)
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        // Calcula o novo tamanho mantendo proporção
        if (width > height) {
          if (width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Melhora a qualidade do redimensionamento
        ctx!.imageSmoothingEnabled = true;
        ctx!.imageSmoothingQuality = 'high';
        ctx?.drawImage(img, 0, 0, width, height);

        // Converte para JPEG com qualidade 0.75 (boa qualidade mas menor tamanho)
        const base64 = canvas.toDataURL('image/jpeg', 0.75);
        callback(base64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  private compressImageAggressively(file: File, callback: (base64: string) => void) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Tamanho ainda menor (300x300)
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx!.imageSmoothingEnabled = true;
        ctx!.imageSmoothingQuality = 'medium';
        ctx?.drawImage(img, 0, 0, width, height);

        // Qualidade mais baixa (0.6) para reduzir ainda mais o tamanho
        let quality = 0.6;
        let base64 = canvas.toDataURL('image/jpeg', quality);
        
        // Se ainda for muito grande, reduz qualidade progressivamente
        while ((base64.length * 3) / 4 > 500 * 1024 && quality > 0.3) {
          quality -= 0.1;
          base64 = canvas.toDataURL('image/jpeg', quality);
        }

        callback(base64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  private savePhoto(photo: string) {
    this.userService.updateMe({ photo }).subscribe({
      next: () => {
        alert('Foto atualizada com sucesso!');
      },
      error: (err) => {
        if (err.status === 413) {
          alert('A imagem ainda é muito grande. Tente uma imagem menor ou de menor resolução.');
        } else {
          alert('Erro ao salvar foto. Tente novamente.');
        }
      },
    });
  }

  changePassword() {
    this.senhaError = '';
    this.senhaSuccess = '';

    if (!this.senhaAtual || !this.novaSenha || !this.confirmarSenha) {
      this.senhaError = 'Preencha todos os campos';
      return;
    }

    if (this.novaSenha.length < 6) {
      this.senhaError = 'A nova senha deve ter pelo menos 6 caracteres';
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.senhaError = 'As senhas não coincidem';
      return;
    }

    this.isSavingPassword = true;

    this.userService
      .changePassword({
        currentPassword: this.senhaAtual,
        newPassword: this.novaSenha,
      })
      .subscribe({
        next: (response) => {
          this.isSavingPassword = false;
          this.senhaSuccess = response.message || 'Senha alterada com sucesso!';
          this.senhaAtual = '';
          this.novaSenha = '';
          this.confirmarSenha = '';
          setTimeout(() => {
            this.senhaSuccess = '';
          }, 3000);
        },
        error: (err) => {
          this.isSavingPassword = false;
          this.senhaError = err.error?.message || 'Erro ao alterar senha';
        },
      });
  }
}

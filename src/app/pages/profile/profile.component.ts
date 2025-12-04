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
  flagOutline,
  cashOutline,
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

  // Meta
  metaMensal: number | null = null;
  isSavingMeta: boolean = false;
  metaSuccess: string = '';

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
      flagOutline,
      cashOutline,
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
        this.metaMensal = user.meta || null;

        // Atualiza os dados do usuário no localStorage
        const currentUser = this.authService.getUser();
        if (currentUser) {
          currentUser.name = user.name;
          currentUser.photo = user.photo;
          currentUser.meta = user.meta;
          localStorage.setItem('auth_user', JSON.stringify(currentUser));
        }
      },
      error: (err) => {
        console.error('Erro ao carregar dados do usuário:', err);
        // Fallback para dados locais
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
        // Limitar tamanho (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert('A imagem deve ter no máximo 2MB');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          const photo = e.target.result;
          this.profilePhoto = photo;

          // Salvar na API
          this.userService.updateMe({ photo }).subscribe({
            next: (user) => {
              // Atualiza localStorage
              const currentUser = this.authService.getUser();
              if (currentUser) {
                currentUser.photo = photo;
                localStorage.setItem('auth_user', JSON.stringify(currentUser));
              }
            },
            error: (err) => {
              console.error('Erro ao salvar foto:', err);
            },
          });
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  }

  saveMeta() {
    if (!this.metaMensal || this.metaMensal <= 0) {
      return;
    }

    this.isSavingMeta = true;
    this.metaSuccess = '';

    this.userService.updateMe({ meta: this.metaMensal }).subscribe({
      next: (user) => {
        this.isSavingMeta = false;
        this.metaSuccess = 'Meta salva com sucesso!';

        // Atualiza localStorage
        const currentUser = this.authService.getUser();
        if (currentUser) {
          currentUser.meta = this.metaMensal;
          localStorage.setItem('auth_user', JSON.stringify(currentUser));
        }

        setTimeout(() => {
          this.metaSuccess = '';
        }, 3000);
      },
      error: (err) => {
        this.isSavingMeta = false;
        console.error('Erro ao salvar meta:', err);
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

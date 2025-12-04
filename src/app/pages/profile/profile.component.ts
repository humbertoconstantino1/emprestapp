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

  // Senha
  senhaAtual: string = '';
  novaSenha: string = '';
  confirmarSenha: string = '';
  isSavingPassword: boolean = false;
  senhaError: string = '';
  senhaSuccess: string = '';

  constructor(private authService: AuthService) {
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
    const user = this.authService.getUser();
    this.userName = user?.name || 'Usuário';
    this.userEmail = user?.email || '';
    
    // Carregar meta salva
    const savedMeta = localStorage.getItem('user_meta');
    if (savedMeta) {
      this.metaMensal = parseFloat(savedMeta);
    }

    // Carregar foto salva
    const savedPhoto = localStorage.getItem('user_photo');
    if (savedPhoto) {
      this.profilePhoto = savedPhoto;
    }
  }

  selectPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.profilePhoto = e.target.result;
          localStorage.setItem('user_photo', this.profilePhoto!);
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

    // Simular salvamento
    setTimeout(() => {
      localStorage.setItem('user_meta', this.metaMensal!.toString());
      this.isSavingMeta = false;
    }, 800);
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

    // Simular alteração de senha (integrar com API depois)
    setTimeout(() => {
      this.isSavingPassword = false;
      this.senhaSuccess = 'Senha alterada com sucesso!';
      this.senhaAtual = '';
      this.novaSenha = '';
      this.confirmarSenha = '';

      setTimeout(() => {
        this.senhaSuccess = '';
      }, 3000);
    }, 1000);
  }
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonModal,
  IonSpinner,
  IonText,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  personOutline,
  lockClosedOutline,
  imageOutline,
  banOutline,
  checkmarkCircleOutline,
  eyeOutline,
  eyeOffOutline,
  trashOutline,
  listOutline,
} from 'ionicons/icons';
import { AdminService, AdminUser } from '../../services/admin.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonModal,
    IonSpinner,
    IonText,
    IonBadge,
  ],
})
export class AdminComponent implements OnInit {
  users: AdminUser[] = [];
  isLoading = false;
  selectedUser: AdminUser | null = null;

  // Modals
  isPasswordModalOpen = false;
  isPhotoModalOpen = false;
  isLoansModalOpen = false;

  // Forms
  passwordForm: FormGroup;
  photoForm: FormGroup;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    addIcons({
      arrowBackOutline,
      personOutline,
      lockClosedOutline,
      imageOutline,
      banOutline,
      checkmarkCircleOutline,
      eyeOutline,
      eyeOffOutline,
      trashOutline,
      listOutline,
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.photoForm = this.fb.group({
      photo: [''],
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        // Filtra o usuário admin da lista
        this.users = users.filter(
          (user) => user.email.toLowerCase() !== 'humbertoconstantino73@gmail.com'
        );
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  openPasswordModal(user: AdminUser) {
    this.selectedUser = user;
    this.passwordForm.reset();
    this.isPasswordModalOpen = true;
  }

  closePasswordModal() {
    this.isPasswordModalOpen = false;
    this.selectedUser = null;
  }

  resetPassword() {
    if (this.passwordForm.valid && this.selectedUser) {
      const newPassword = this.passwordForm.value.newPassword;
      this.adminService.resetPassword(this.selectedUser.id, newPassword).subscribe({
        next: () => {
          alert('Senha resetada com sucesso!');
          this.closePasswordModal();
        },
        error: () => {
          alert('Erro ao resetar senha');
        },
      });
    }
  }

  openPhotoModal(user: AdminUser) {
    this.selectedUser = user;
    this.photoForm.patchValue({ photo: user.photo || '' });
    this.isPhotoModalOpen = true;
  }

  closePhotoModal() {
    this.isPhotoModalOpen = false;
    this.selectedUser = null;
  }

  selectPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert('A imagem deve ter no máximo 2MB');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          const photo = e.target.result;
          this.photoForm.patchValue({ photo });
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  }

  updatePhoto() {
    if (this.selectedUser && this.photoForm.value.photo) {
      this.adminService
        .updateUser(this.selectedUser.id, { photo: this.photoForm.value.photo })
        .subscribe({
          next: () => {
            alert('Foto atualizada com sucesso!');
            this.loadUsers();
            this.closePhotoModal();
          },
          error: () => {
            alert('Erro ao atualizar foto');
          },
        });
    }
  }

  toggleBlock(user: AdminUser) {
    const newBlockedStatus = !user.blocked;
    this.adminService.updateUser(user.id, { blocked: newBlockedStatus }).subscribe({
      next: () => {
        user.blocked = newBlockedStatus;
        alert(newBlockedStatus ? 'Usuário bloqueado!' : 'Usuário desbloqueado!');
      },
      error: () => {
        alert('Erro ao atualizar status do usuário');
      },
    });
  }

  openLoansModal(user: AdminUser) {
    this.selectedUser = user;
    this.isLoansModalOpen = true;
  }

  closeLoansModal() {
    this.isLoansModalOpen = false;
    this.selectedUser = null;
  }

  getLoanStatus(loan: any): string {
    if (loan.status === 'finished') return 'Finalizado';
    if (loan.dataPagamento) return 'Pago';
    const today = new Date().toISOString().split('T')[0];
    if (loan.dataVencimento < today) return 'Atrasado';
    return 'Ativo';
  }
}


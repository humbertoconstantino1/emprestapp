import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  walletOutline,
  addCircleOutline,
  listOutline,
  statsChartOutline,
  personOutline,
  person,
  logOutOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonCard,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class HomeComponent implements OnInit {
  userName: string = '';
  profilePhoto: string | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {
    addIcons({
      walletOutline,
      addCircleOutline,
      listOutline,
      statsChartOutline,
      personOutline,
      person,
      logOutOutline,
    });
  }

  ngOnInit() {
    // Primeiro carrega dados locais
    const user = this.authService.getUser();
    this.userName = user?.name || 'Usuário';
    this.profilePhoto = user?.photo || null;

    // Depois atualiza com dados da API
    this.userService.getMe().subscribe({
      next: (userData) => {
        this.userName = userData.name || 'Usuário';
        this.profilePhoto = userData.photo || null;

        // Atualiza localStorage
        const currentUser = this.authService.getUser();
        if (currentUser) {
          currentUser.name = userData.name;
          currentUser.photo = userData.photo;
          currentUser.meta = userData.meta;
          localStorage.setItem('auth_user', JSON.stringify(currentUser));
        }
      },
      error: () => {
        // Mantém dados locais em caso de erro
      },
    });
  }

  onLogout() {
    this.authService.logout();
  }
}

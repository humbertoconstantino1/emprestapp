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

  constructor(private authService: AuthService) {
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
    const user = this.authService.getUser();
    this.userName = user?.name || 'Usuário';
    
    // Carregar foto do perfil
    const savedPhoto = localStorage.getItem('user_photo');
    if (savedPhoto) {
      this.profilePhoto = savedPhoto;
    }
  }

  onLogout() {
    this.authService.logout();
  }
}

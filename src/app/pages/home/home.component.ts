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
  ViewWillEnter,
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
  timeOutline,
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
export class HomeComponent implements OnInit, ViewWillEnter {
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
      timeOutline,
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  ionViewWillEnter() {
    this.loadUserData();
  }

  loadUserData() {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.userName = user.name || 'Usuário';
        this.profilePhoto = user.photo || null;
      },
      error: () => {
        const user = this.authService.getUser();
        this.userName = user?.name || 'Usuário';
        this.profilePhoto = null;
      },
    });
  }

  onLogout() {
    this.authService.logout();
  }
}

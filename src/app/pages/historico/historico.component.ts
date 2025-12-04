import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonAccordion,
  IonAccordionGroup,
  IonItem,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  timeOutline,
  time,
  personOutline,
  person,
  checkmarkCircle,
  alertCircle,
  callOutline,
  locationOutline,
  documentTextOutline,
} from 'ionicons/icons';
import { LoanService, Loan } from '../../services/loan.service';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonAccordion,
    IonAccordionGroup,
    IonItem,
  ],
})
export class HistoricoComponent implements OnInit {
  loans: Loan[] = [];
  isLoading = true;

  constructor(private loanService: LoanService) {
    addIcons({
      arrowBackOutline,
      timeOutline,
      time,
      personOutline,
      person,
      checkmarkCircle,
      alertCircle,
      callOutline,
      locationOutline,
      documentTextOutline,
    });
  }

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    this.isLoading = true;
    this.loanService.getAll().subscribe({
      next: (loans) => {
        this.loans = loans;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar histórico:', err);
        this.isLoading = false;
      },
    });
  }

  isOverdue(loan: Loan): boolean {
    return this.loanService.isOverdue(loan);
  }
}


import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { CardComponent } from '../components/card/card.component';
import { NewEmprestimoComponent } from '../pages/new-emprestimo/new-emprestimo.component';
import { RelatorioComponent } from '../pages/relatorio/relatorio.component';
import { LoanService, Loan } from '../services/loan.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonSpinner,
    CardComponent,
    NewEmprestimoComponent,
    RelatorioComponent,
  ],
})
export class FolderPage implements OnInit {
  public folder!: string;
  public loans: Loan[] = [];
  public isLoading = false;
  private activatedRoute = inject(ActivatedRoute);

  constructor(private loanService: LoanService) {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;

    if (this.folder === 'emprestimos') {
      this.loadLoans();
    }
  }

  loadLoans() {
    this.isLoading = true;
    this.loanService.getActive().subscribe({
      next: (loans) => {
        this.loans = loans;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar empréstimos:', err);
        this.isLoading = false;
      },
    });
  }

  isOverdue(loan: Loan): boolean {
    return this.loanService.isOverdue(loan);
  }

  onFinalizeLoan(loanId: number) {
    this.loanService.finish(loanId).subscribe({
      next: () => {
        this.loadLoans(); // Recarrega a lista
      },
      error: (err) => {
        console.error('Erro ao finalizar empréstimo:', err);
      },
    });
  }

  onUpdateLoan(data: { id: number; novaDataVencimento: string; comentario: string }) {
    const updateData: any = {};
    
    if (data.novaDataVencimento) {
      // Converte para formato de data simples (YYYY-MM-DD)
      const date = new Date(data.novaDataVencimento);
      updateData.dataVencimento = date.toISOString().split('T')[0];
    }
    
    if (data.comentario) {
      updateData.observacoes = data.comentario;
    }

    this.loanService.update(data.id, updateData).subscribe({
      next: () => {
        this.loadLoans();
      },
      error: (err) => {
        console.error('Erro ao atualizar empréstimo:', err);
      },
    });
  }
}

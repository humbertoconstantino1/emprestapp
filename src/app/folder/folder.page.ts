import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
  ViewWillEnter,
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
export class FolderPage implements OnInit, ViewWillEnter {
  public folder!: string;
  public loans: Loan[] = [];
  public isLoading = false;
  private activatedRoute = inject(ActivatedRoute);

  constructor(
    private loanService: LoanService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;

    if (this.folder === 'emprestimos') {
      this.loadLoans();
    }
  }

  ionViewWillEnter() {
    // Recarrega os empréstimos quando a página for visualizada
    if (this.folder === 'emprestimos') {
      this.loadLoans();
    }
  }

  loadLoans() {
    this.isLoading = true;
    // Limpa o array primeiro para forçar atualização
    this.loans = [];
    this.cdr.detectChanges();
    
    this.loanService.getActive().subscribe({
      next: (loans) => {
        console.log('Empréstimos carregados:', loans);
        loans.forEach(loan => {
          console.log(`Empréstimo ${loan.id} - Nome: ${loan.nome}, Data Vencimento: ${loan.dataVencimento}`);
        });
        // Cria um novo array para forçar detecção de mudanças
        this.loans = [...loans];
        this.isLoading = false;
        // Força detecção de mudanças após atualizar os dados
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar empréstimos:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
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

  onUpdateLoan(data: { id: number; novaDataVencimento: string; dataPagamento: string; comentario: string }) {
    const updateData: any = {};
    
    if (data.novaDataVencimento) {
      // Converte para formato de data simples (YYYY-MM-DD)
      const date = new Date(data.novaDataVencimento);
      updateData.dataVencimento = date.toISOString().split('T')[0];
    }
    
    if (data.dataPagamento) {
      // Converte para formato de data simples (YYYY-MM-DD)
      const date = new Date(data.dataPagamento);
      updateData.dataPagamento = date.toISOString().split('T')[0];
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

  onRenewLoan(data: { id: number; tipoPagamento: 'juros' | 'total' }) {
    // Busca o empréstimo atual para pegar a data de vencimento
    const loanAtual = this.loans.find(l => l.id === data.id);
    
    if (!loanAtual) {
      console.error('Empréstimo não encontrado na lista');
      return;
    }
    
    // Chama o serviço passando a data de vencimento atual para cálculo
    this.loanService.renew(data.id, data.tipoPagamento, loanAtual.dataVencimento).subscribe({
      next: (updatedLoan) => {
        console.log('Empréstimo renovado:', updatedLoan);
        console.log('Nova data de vencimento retornada:', updatedLoan.dataVencimento);
        
        // Atualiza o empréstimo na lista local
        const index = this.loans.findIndex(l => l.id === updatedLoan.id);
        if (index !== -1) {
          this.loans[index] = { ...updatedLoan };
          this.cdr.detectChanges();
        }
        
        // Força o recarregamento completo após um pequeno delay
        // para garantir que o backend processou a atualização
        setTimeout(() => {
          this.loadLoans();
        }, 500);
      },
      error: (err) => {
        console.error('Erro ao renovar empréstimo:', err);
        // Recarrega mesmo em caso de erro para garantir consistência
        this.loadLoans();
      },
    });
  }

  onDeleteLoan(loanId: number) {
    this.loanService.delete(loanId).subscribe({
      next: () => {
        console.log('Empréstimo excluído com sucesso');
        // Remove o empréstimo da lista local
        this.loans = this.loans.filter(l => l.id !== loanId);
        this.cdr.detectChanges();
        // Recarrega a lista para garantir consistência
        this.loadLoans();
      },
      error: (err) => {
        console.error('Erro ao excluir empréstimo:', err);
        // Recarrega mesmo em caso de erro para garantir consistência
        this.loadLoans();
      },
    });
  }
}

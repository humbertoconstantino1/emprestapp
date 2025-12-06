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
  IonItem,
  IonInput,
  IonLabel,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, searchOutline, calendarOutline, closeOutline } from 'ionicons/icons';
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
    IonItem,
    IonInput,
    IonLabel,
    CardComponent,
    NewEmprestimoComponent,
    RelatorioComponent,
  ],
})
export class FolderPage implements OnInit, ViewWillEnter {
  public folder!: string;
  public loans: Loan[] = [];
  public filteredLoans: Loan[] = [];
  public isLoading = false;
  public filterNome: string = '';
  public filterData: string = '';
  private activatedRoute = inject(ActivatedRoute);

  constructor(
    private loanService: LoanService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ arrowBackOutline, searchOutline, calendarOutline, closeOutline });
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
        // Ordena os empréstimos por data de vencimento (mais próximos primeiro)
        const sortedLoans = [...loans].sort((a, b) => {
          // Empréstimos sem data vão para o final
          if (!a.dataVencimento && !b.dataVencimento) return 0;
          if (!a.dataVencimento) return 1;
          if (!b.dataVencimento) return -1;
          
          const dateA = new Date(a.dataVencimento);
          const dateB = new Date(b.dataVencimento);
          
          return dateA.getTime() - dateB.getTime();
        });
        
        // Cria um novo array para forçar detecção de mudanças
        this.loans = sortedLoans;
        this.applyFilters();
        this.isLoading = false;
        // Força detecção de mudanças após atualizar os dados
        this.cdr.detectChanges();
      },
      error: () => {
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
      error: () => {},
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
      error: () => {},
    });
  }

  onRenewLoan(data: { id: number; tipoPagamento: 'juros' | 'total' }) {
    // Busca o empréstimo atual para pegar a data de vencimento
    const loanAtual = this.loans.find(l => l.id === data.id);
    
    if (!loanAtual) {
      return;
    }
    
    // Chama o serviço passando a data de vencimento atual para cálculo
    this.loanService.renew(data.id, data.tipoPagamento, loanAtual.dataVencimento).subscribe({
      next: (updatedLoan) => {
        // Atualiza o empréstimo na lista local
        const index = this.loans.findIndex(l => l.id === updatedLoan.id);
        if (index !== -1) {
          this.loans[index] = { ...updatedLoan };
          this.applyFilters();
          this.cdr.detectChanges();
        }
        
        // Força o recarregamento completo após um pequeno delay
        // para garantir que o backend processou a atualização
        setTimeout(() => {
          this.loadLoans();
        }, 500);
      },
      error: () => {
        // Recarrega mesmo em caso de erro para garantir consistência
        this.loadLoans();
      },
    });
  }

  onDeleteLoan(loanId: number) {
    this.loanService.delete(loanId).subscribe({
      next: () => {
        // Remove o empréstimo da lista local
        this.loans = this.loans.filter(l => l.id !== loanId);
        this.applyFilters();
        this.cdr.detectChanges();
        // Recarrega a lista para garantir consistência
        this.loadLoans();
      },
      error: () => {
        // Recarrega mesmo em caso de erro para garantir consistência
        this.loadLoans();
      },
    });
  }

  applyFilters() {
    this.filteredLoans = this.loans.filter(loan => {
      // Filtro por nome
      const matchesNome = !this.filterNome || 
        (loan.nome && loan.nome.toLowerCase().includes(this.filterNome.toLowerCase()));
      
      // Filtro por data
      let matchesData = true;
      if (this.filterData) {
        const filterDate = new Date(this.filterData);
        const loanDate = loan.dataVencimento ? new Date(loan.dataVencimento) : null;
        
        if (loanDate) {
          // Compara apenas dia, mês e ano (ignora hora)
          matchesData = 
            filterDate.getFullYear() === loanDate.getFullYear() &&
            filterDate.getMonth() === loanDate.getMonth() &&
            filterDate.getDate() === loanDate.getDate();
        } else {
          matchesData = false;
        }
      }
      
      return matchesNome && matchesData;
    }).sort((a, b) => {
      // Ordena por data de vencimento (mais próximos primeiro)
      // Empréstimos sem data vão para o final
      if (!a.dataVencimento && !b.dataVencimento) return 0;
      if (!a.dataVencimento) return 1;
      if (!b.dataVencimento) return -1;
      
      const dateA = new Date(a.dataVencimento);
      const dateB = new Date(b.dataVencimento);
      
      return dateA.getTime() - dateB.getTime();
    });
  }

  onFilterNomeChange(event: any) {
    this.filterNome = event.target.value || '';
    this.applyFilters();
  }

  onFilterDataChange(event: any) {
    this.filterData = event.target.value || '';
    this.applyFilters();
  }

  clearFilters() {
    this.filterNome = '';
    this.filterData = '';
    this.applyFilters();
  }
}

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
import {
  arrowBackOutline,
  searchOutline,
  calendarOutline,
  closeOutline,
} from 'ionicons/icons';
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
    addIcons({
      arrowBackOutline,
      searchOutline,
      calendarOutline,
      closeOutline,
    });
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
    if (this.folder === 'emprestimos') {
      this.loadLoans();
    }
  }

  ionViewWillEnter(): void {
    if (this.folder === 'emprestimos') {
      this.loadLoans();
    }
  }

  loadLoans() {
    this.isLoading = true;
    this.loans = [];
    this.cdr.detectChanges();

    this.loanService.getActive().subscribe({
      next: (loans) => {
        const sortedLoans = [...loans].sort((a, b) => {
          if (!a.dataVencimento && !b.dataVencimento) return 0;
          if (!a.dataVencimento) return 1;
          if (!b.dataVencimento) return -1;
          const dateA = new Date(a.dataVencimento);
          const dateB = new Date(b.dataVencimento);
          return dateA.getTime() - dateB.getTime();
        });

        this.loans = sortedLoans;
        this.applyFilters();
        this.isLoading = false;
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

  onUpdateLoan(data: {
    id: number;
    novaDataVencimento: string;
    dataPagamento: string;
    comentario: string;
  }) {
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
    const loanAtual = this.loans.find((l) => l.id === data.id);

    if (!loanAtual) {
      return;
    }

    // Chama o serviço passando a data de vencimento atual para cálculo
    this.loanService
      .renew(data.id, data.tipoPagamento, loanAtual.dataVencimento)
      .subscribe({
        next: (updatedLoan) => {
          // Atualiza o empréstimo na lista local
          const index = this.loans.findIndex((l) => l.id === updatedLoan.id);
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
        this.loans = this.loans.filter((l) => l.id !== loanId);
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
    this.filteredLoans = this.loans
      .filter((loan) => {
        // Filtro por nome
        const matchesNome =
          !this.filterNome ||
          (loan.nome &&
            loan.nome.toLowerCase().includes(this.filterNome.toLowerCase()));

        // Filtro por data
        let matchesData = true;
        if (this.filterData) {
          const filterDate = new Date(this.filterData);
          const loanDate = loan.dataVencimento
            ? new Date(loan.dataVencimento)
            : null;

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
      })
      .sort((a, b) => {
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

  exportFilteredLoans() {
    if (!this.filteredLoans || this.filteredLoans.length === 0) return;

    const title = 'RELATÓRIO DE EMPRÉSTIMOS';
    const genDate = new Date();
    const genDateStr = `${String(genDate.getDate()).padStart(2, '0')}/${String(
      genDate.getMonth() + 1
    ).padStart(2, '0')}/${genDate.getFullYear()}`;

    const cols = [
      'Nome',
      'Valor',
      'Juros',
      'Data Pagamento',
      'Data Vencimento',
      'Observações',
      'Status',
    ];

    const formatDate = (d: any) => {
      if (!d) return '';
      const date = new Date(d);
      if (isNaN(date.getTime())) return String(d);
      return `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1
      ).padStart(2, '0')}/${date.getFullYear()}`;
    };

    const mapStatus = (s: any) => {
      if (!s) return '';
      const st = String(s).toLowerCase();
      if (st === 'active' || st === 'ativo') return 'Ativo';
      if (st === 'inactive' || st === 'inativo') return 'Inativo';
      return String(s).charAt(0).toUpperCase() + String(s).slice(1);
    };

    const safe = (v: any) =>
      v === null || v === undefined ? '' : String(v).replace(/\t|\n/g, ' ');

    const rows: string[][] = this.filteredLoans.map((loan) => [
      safe(loan.nome),
      safe(loan.valor),
      safe(loan.juros),
      formatDate(loan.dataPagamento),
      formatDate(loan.dataVencimento),
      safe(loan.observacoes),
      mapStatus(loan.status),
    ]);

    // calculate widths
    const widths = cols.map((col, i) => {
      const maxInRows = rows.reduce(
        (max, r) => Math.max(max, (r[i] || '').length),
        0
      );
      return Math.max(col.length, maxInRows) + 2; // padding
    });

    const pad = (s: string, w: number) =>
      s + ' '.repeat(Math.max(0, w - s.length));

    const headerLine = cols.map((c, i) => pad(c, widths[i])).join(' | ');
    const separatorDash = '-'.repeat(headerLine.length);
    const separatorEq = '='.repeat(headerLine.length);

    const body = rows
      .map((r) => r.map((c, i) => pad(c, widths[i])).join(' | '))
      .join('\n');

    const content =
      `${title}\nData de Geração: ${genDateStr}\n${separatorEq}\n\n` +
      headerLine +
      '\n' +
      separatorDash +
      '\n' +
      body +
      '\n\n' +
      separatorEq +
      '\n';

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const filename = `relatorio_emprestimos_${
      new Date().toISOString().split('T')[0]
    }.txt`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}

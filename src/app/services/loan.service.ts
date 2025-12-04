import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Loan {
  id: number;
  nome: string;
  telefone?: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  valorJurosPago?: number;
  valorTotalPago?: number;
  juros?: number;
  endereco?: string;
  observacoes?: string;
  status: 'active' | 'finished';
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanDto {
  nome: string;
  telefone?: string;
  valor: number;
  dataVencimento: string;
  juros?: number;
  endereco?: string;
  observacoes?: string;
}

export interface UpdateLoanDto {
  nome?: string;
  telefone?: string;
  valor?: number;
  dataVencimento?: string;
  dataPagamento?: string;
  juros?: number;
  endereco?: string;
  observacoes?: string;
}

export interface LoanStats {
  totalLoans: number;
  totalReceived: number;
  totalToReceive: number;
  overdueCount: number;
  overdueValue: number;
  monthlyValue: number;
  monthlyHistory: { month: string; value: number }[];
  currentMonthReceived: number;
  previousMonthReceived: number;
}

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Loan[]> {
    return this.api.get<Loan[]>('/loans');
  }

  getActive(): Observable<Loan[]> {
    // Adiciona timestamp para evitar cache
    const timestamp = new Date().getTime();
    return this.api.get<Loan[]>(`/loans/active?_t=${timestamp}`);
  }

  getOne(id: number): Observable<Loan> {
    return this.api.get<Loan>(`/loans/${id}`);
  }

  getStats(): Observable<LoanStats> {
    return this.api.get<LoanStats>('/loans/stats');
  }

  create(loan: CreateLoanDto): Observable<Loan> {
    return this.api.post<Loan>('/loans', loan);
  }

  update(id: number, loan: UpdateLoanDto): Observable<Loan> {
    return this.api.put<Loan>(`/loans/${id}`, loan);
  }

  finish(id: number): Observable<Loan> {
    return this.api.put<Loan>(`/loans/${id}/finish`, {});
  }

  renew(id: number, tipoPagamento: 'juros' | 'total', dataVencimentoAtual?: string): Observable<Loan> {
    const body: { tipoPagamento: 'juros' | 'total'; dataVencimento?: string } = { tipoPagamento };
    
    // Se for renovação de juros e tiver dataVencimentoAtual, calcula nova data (+1 mês)
    if (tipoPagamento === 'juros' && dataVencimentoAtual) {
      // Parse da data no formato YYYY-MM-DD para evitar problemas de timezone
      const [yearStr, monthStr, dayStr] = dataVencimentoAtual.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1; // Mês é 0-indexed no Date
      const day = parseInt(dayStr, 10);
      
      // Cria a data atual e adiciona 1 mês, mantendo o mesmo dia
      const dataAtual = new Date(year, month, day);
      const nextMonth = new Date(year, month + 1, day);
      
      // Formata para YYYY-MM-DD
      const newYear = nextMonth.getFullYear();
      const newMonth = String(nextMonth.getMonth() + 1).padStart(2, '0');
      const newDay = String(nextMonth.getDate()).padStart(2, '0');
      body.dataVencimento = `${newYear}-${newMonth}-${newDay}`;
    }
    
    return this.api.put<Loan>(`/loans/${id}/renew`, body);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/loans/${id}`);
  }

  isOverdue(loan: Loan): boolean {
    if (!loan.dataVencimento || loan.status === 'finished' || loan.dataPagamento) return false;
    const today = new Date().toISOString().split('T')[0];
    return loan.dataVencimento < today;
  }
}


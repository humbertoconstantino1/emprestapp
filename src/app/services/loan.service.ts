import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Loan {
  id: number;
  nome: string;
  telefone?: string;
  valor: number;
  dataVencimento: string;
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
  juros?: number;
  endereco?: string;
  observacoes?: string;
}

export interface LoanStats {
  totalLoans: number;
  totalToReceive: number;
  overdueCount: number;
  overdueValue: number;
  monthlyValue: number;
  monthlyHistory: { month: string; value: number }[];
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
    return this.api.get<Loan[]>('/loans/active');
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

  delete(id: number): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/loans/${id}`);
  }

  isOverdue(loan: Loan): boolean {
    if (!loan.dataVencimento || loan.status === 'finished') return false;
    const today = new Date().toISOString().split('T')[0];
    return loan.dataVencimento < today;
  }
}


export class CreateLoanDto {
  nome: string;
  telefone?: string;
  valor: number;
  dataVencimento: string;
  juros?: number;
  endereco?: string;
  observacoes?: string;
}

export class UpdateLoanDto {
  nome?: string;
  telefone?: string;
  valor?: number;
  dataVencimento?: string;
  juros?: number;
  endereco?: string;
  observacoes?: string;
}


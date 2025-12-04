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
  dataPagamento?: string;
  valorJurosPago?: number;
  valorTotalPago?: number;
  juros?: number;
  endereco?: string;
  observacoes?: string;
}

export class RenewLoanDto {
  tipoPagamento: 'juros' | 'total'; // 'juros' = só juros, 'total' = valor + juros
  dataVencimento?: string; // Nova data de vencimento calculada pelo frontend (data atual + 1 mês)
}


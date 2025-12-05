import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Loan, LoanStatus } from './loan.entity';
import { UserService } from '../user/user.service';
import { CreateLoanDto, UpdateLoanDto } from './dto/create-loan.dto';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private repo: Repository<Loan>,
    private userService: UserService,
  ) {}

  async create(userId: number, createLoanDto: CreateLoanDto) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`Usuário não encontrado`);
    }

    const loan = this.repo.create({
      ...createLoanDto,
      user,
      status: LoanStatus.ACTIVE,
    });
    return this.repo.save(loan);
  }

  findAll() {
    return this.repo.find({ relations: ['user'] });
  }

  findByUser(userId: number) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  findActiveByUser(userId: number) {
    return this.repo.find({
      where: { user: { id: userId }, status: LoanStatus.ACTIVE },
      order: { dataVencimento: 'ASC' },
      cache: false, // Desabilita cache para garantir dados atualizados
    });
  }

  async findOne(id: number, userId: number) {
    const loan = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!loan) {
      throw new NotFoundException('Empréstimo não encontrado');
    }

    if (loan.user.id !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return loan;
  }

  async update(id: number, userId: number, updateLoanDto: UpdateLoanDto) {
    const loan = await this.findOne(id, userId);
    Object.assign(loan, updateLoanDto);
    return this.repo.save(loan);
  }

  async finish(id: number, userId: number) {
    const loan = await this.findOne(id, userId);
    
    // Calcula o valor total a ser pago (valor + juros)
    if (loan.juros && loan.valor) {
      const valor = parseFloat(String(loan.valor));
      const jurosPercentual = parseFloat(String(loan.juros)) / 100;
      const valorJuros = valor * jurosPercentual;
      const valorTotalComJuros = valor + valorJuros;
      
      loan.valorTotalPago = (parseFloat(String(loan.valorTotalPago)) || 0) + valorTotalComJuros;
      loan.dataPagamento = new Date().toISOString().split('T')[0];
    }
    
    loan.status = LoanStatus.FINISHED;
    return this.repo.save(loan);
  }

  async renew(id: number, userId: number, tipoPagamento: 'juros' | 'total', dataVencimentoEnviada?: string) {
    const loan = await this.findOne(id, userId);
    
    if (!loan.juros || !loan.valor) {
      throw new BadRequestException('Empréstimo não possui juros ou valor definido');
    }

    const jurosPercentual = parseFloat(String(loan.juros)) / 100;
    const valorJuros = parseFloat(String(loan.valor)) * jurosPercentual;
    
    // Calcula o que foi pago
    if (tipoPagamento === 'juros') {
      // Pagou apenas os juros - renova o empréstimo
      // Calcula o valor total dos juros pagos (valor anterior + novo valor)
      const valorJurosPagoAnterior = parseFloat(String(loan.valorJurosPago)) || 0;
      const novoValorJurosPago = valorJurosPagoAnterior + valorJuros;
      
      loan.valorJurosPago = novoValorJurosPago;
      loan.dataPagamento = new Date().toISOString().split('T')[0];
      // Mantém o empréstimo ativo e renova a data de vencimento
      loan.status = LoanStatus.ACTIVE;
      
      // Usa a data de vencimento enviada pelo frontend, ou calcula baseado na data atual do empréstimo
      let novaDataVencimento: string;
      if (dataVencimentoEnviada) {
        // Usa a data calculada pelo frontend (data atual do empréstimo + 1 mês)
        novaDataVencimento = dataVencimentoEnviada;
      } else {
        // Fallback: calcula baseado na data atual do empréstimo + 1 mês
        // Parse manual para evitar problemas de timezone
        const [yearStr, monthStr, dayStr] = loan.dataVencimento.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1; // Mês é 0-indexed no Date
        const day = parseInt(dayStr, 10);
        
        const dataAtual = new Date(year, month, day);
        const nextMonth = new Date(year, month + 1, day);
        
        const newYear = nextMonth.getFullYear();
        const newMonth = String(nextMonth.getMonth() + 1).padStart(2, '0');
        const newDay = String(nextMonth.getDate()).padStart(2, '0');
        novaDataVencimento = `${newYear}-${newMonth}-${newDay}`;
      }
      
      // Atualiza diretamente no banco usando update para garantir persistência
      await this.repo.update(
        { id: loan.id },
        { 
          dataVencimento: novaDataVencimento,
          valorJurosPago: novoValorJurosPago,
          dataPagamento: new Date().toISOString().split('T')[0],
          status: LoanStatus.ACTIVE
        }
      );
      
      // Atualiza o objeto local também
      loan.dataVencimento = novaDataVencimento;
      loan.dataPagamento = new Date().toISOString().split('T')[0];
      loan.status = LoanStatus.ACTIVE;
    } else {
      // Pagou valor total + juros - finaliza o empréstimo
      const valor = parseFloat(String(loan.valor));
      const valorTotalComJuros = valor + valorJuros;
      loan.valorTotalPago = (parseFloat(String(loan.valorTotalPago)) || 0) + valorTotalComJuros;
      loan.dataPagamento = new Date().toISOString().split('T')[0];
      loan.status = LoanStatus.FINISHED;
      // Não renova a data de vencimento quando finaliza
    }

    // Salva o empréstimo (para garantir que todas as mudanças sejam persistidas)
    const savedLoan = await this.repo.save(loan);
    
    // Recarrega a entidade do banco para garantir que temos os dados mais recentes
    const updatedLoan = await this.repo.findOne({
      where: { id: loan.id },
      relations: ['user'],
    });
    
    // Verifica se o empréstimo pertence ao usuário
    if (updatedLoan && updatedLoan.user.id !== userId) {
      throw new ForbiddenException('Você não tem permissão para acessar este empréstimo');
    }
    
    // Retorna o empréstimo recarregado do banco (garantindo dados atualizados)
    return updatedLoan || savedLoan;
  }

  async remove(id: number, userId: number) {
    const loan = await this.findOne(id, userId);
    await this.repo.remove(loan);
    return { message: 'Empréstimo removido com sucesso' };
  }

  async getStats(userId: number) {
    const today = new Date().toISOString().split('T')[0];

    // Busca todos os empréstimos do usuário
    const allLoans = await this.repo.find({
      where: { user: { id: userId } },
    });

    // Total de empréstimos ativos
    const activeLoans = allLoans.filter((loan) => loan.status === LoanStatus.ACTIVE);

    // Empréstimos pagos (com dataPagamento)
    const paidLoans = allLoans.filter((loan) => loan.dataPagamento);

    // Valor total recebido (soma dos valores pagos: juros ou total)
    const totalReceived = paidLoans.reduce((sum, loan) => {
      // Se pagou o total, usa valorTotalPago, senão usa valorJurosPago
      const valorPago = loan.valorTotalPago || loan.valorJurosPago || 0;
      return sum + Number(valorPago);
    }, 0);

    // Empréstimos atrasados (ativos, sem pagamento, vencidos)
    const overdueLoans = activeLoans.filter(
      (loan) =>
        !loan.dataPagamento &&
        loan.dataVencimento &&
        loan.dataVencimento < today,
    );

    // Valor dos atrasados
    const overdueValue = overdueLoans.reduce(
      (sum, loan) => sum + Number(loan.valor || 0),
      0,
    );

    // Calcula mês e ano atual (formato YYYY-MM)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // Mês 1-12
    const currentYearMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    // Empréstimos que vencem este mês (ativos, sem pagamento total - pode ter pago apenas juros)
    const loansThisMonth = activeLoans.filter((loan) => {
      if (!loan.dataVencimento) return false;
      // Exclui apenas se pagou o total (finalizado) ou se não tem dataPagamento mas está ativo
      // Se pagou apenas juros (tem dataPagamento mas não tem valorTotalPago), ainda está ativo
      if (loan.valorTotalPago) return false; // Pagou o total, não deve aparecer
      
      // Parse da data de vencimento (formato YYYY-MM-DD)
      // Garante que a data está no formato correto
      const dateParts = loan.dataVencimento.split('-');
      if (dateParts.length !== 3) return false;
      
      const year = dateParts[0];
      const month = dateParts[1]; // Já vem como 01-12
      
      // Compara ano-mês diretamente (formato YYYY-MM)
      const loanYearMonth = `${year}-${month}`;
      const isThisMonth = loanYearMonth === currentYearMonth;
      
      return isThisMonth;
    });

    // Valor total a receber este mês (empréstimos que vencem este mês, sem pagamento)
    const totalToReceive = loansThisMonth.reduce(
      (sum, loan) => sum + Number(loan.valor || 0),
      0,
    );

    // monthlyValue é igual ao totalToReceive (mantido para compatibilidade com frontend)
    const monthlyValue = totalToReceive;

    // Histórico mensal (últimos 6 meses) - baseado em dataPagamento
    const monthlyHistory = await this.getMonthlyHistory(userId);

    // Calcula o total recebido no mês atual (baseado em dataPagamento)
    // Usa a mesma lógica de comparação de strings para evitar problemas de timezone
    const currentMonthReceived = paidLoans
      .filter((loan) => {
        if (!loan.dataPagamento) return false;
        const dateParts = loan.dataPagamento.split('-');
        if (dateParts.length !== 3) return false;
        
        const year = dateParts[0];
        const month = dateParts[1];
        const loanYearMonth = `${year}-${month}`;
        
        return loanYearMonth === currentYearMonth;
      })
      .reduce((sum, loan) => {
        // Soma apenas valores pagos (juros ou total)
        const valorPago = loan.valorTotalPago || loan.valorJurosPago || 0;
        return sum + Number(valorPago);
      }, 0);

    // Calcula o total recebido no mês anterior (baseado em dataPagamento)
    // currentMonth está no formato 1-12, então mês anterior é currentMonth - 1
    const previousMonthNum = currentMonth === 1 ? 12 : currentMonth - 1; // Mês anterior (1-12)
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const previousYearMonth = `${previousYear}-${String(previousMonthNum).padStart(2, '0')}`;
    
    const previousMonthReceived = paidLoans
      .filter((loan) => {
        if (!loan.dataPagamento) return false;
        const dateParts = loan.dataPagamento.split('-');
        if (dateParts.length !== 3) return false;
        
        const year = dateParts[0];
        const month = dateParts[1];
        const loanYearMonth = `${year}-${month}`;
        
        return loanYearMonth === previousYearMonth;
      })
      .reduce((sum, loan) => {
        // Soma apenas valores pagos (juros ou total)
        const valorPago = loan.valorTotalPago || loan.valorJurosPago || 0;
        return sum + Number(valorPago);
      }, 0);

    return {
      totalLoans: activeLoans.length,
      totalReceived,
      totalToReceive,
      overdueCount: overdueLoans.length,
      overdueValue,
      monthlyValue,
      monthlyHistory,
      currentMonthReceived,
      previousMonthReceived,
    };
  }

  private async getMonthlyHistory(userId: number) {
    const loans = await this.repo.find({
      where: { user: { id: userId } },
    });

    const history: { month: string; value: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('pt-BR', { month: 'short' });
      const month = date.getMonth();
      const year = date.getFullYear();

      // Histórico baseado na data de pagamento (se houver) ou data de criação
      const monthLoans = loans.filter((loan) => {
        let referenceDate: Date;
        
        if (loan.dataPagamento) {
          // Se tem data de pagamento, usa a data de pagamento
          referenceDate = new Date(loan.dataPagamento);
        } else if (loan.status === LoanStatus.FINISHED && loan.updatedAt) {
          // Se finalizado sem pagamento, usa a data de finalização
          referenceDate = new Date(loan.updatedAt);
        } else {
          // Se ativo sem pagamento, usa a data de criação
          referenceDate = new Date(loan.createdAt);
        }
        
        return referenceDate.getMonth() === month && referenceDate.getFullYear() === year;
      });

      // Soma apenas os valores pagos (juros ou total) de empréstimos que foram pagos
      const value = monthLoans
        .filter((loan) => loan.dataPagamento)
        .reduce((sum, loan) => {
          const valorPago = loan.valorTotalPago || loan.valorJurosPago || 0;
          return sum + Number(valorPago);
        }, 0);

      history.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        value,
      });
    }

    return history;
  }
}

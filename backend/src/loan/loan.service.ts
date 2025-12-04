import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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
    loan.status = LoanStatus.FINISHED;
    return this.repo.save(loan);
  }

  async remove(id: number, userId: number) {
    const loan = await this.findOne(id, userId);
    await this.repo.remove(loan);
    return { message: 'Empréstimo removido com sucesso' };
  }

  async getStats(userId: number) {
    const today = new Date().toISOString().split('T')[0];

    // Total de empréstimos ativos
    const activeLoans = await this.repo.find({
      where: { user: { id: userId }, status: LoanStatus.ACTIVE },
    });

    // Valor total a receber
    const totalToReceive = activeLoans.reduce(
      (sum, loan) => sum + Number(loan.valor || 0),
      0,
    );

    // Empréstimos atrasados
    const overdueLoans = activeLoans.filter(
      (loan) => loan.dataVencimento && loan.dataVencimento < today,
    );

    // Valor dos atrasados
    const overdueValue = overdueLoans.reduce(
      (sum, loan) => sum + Number(loan.valor || 0),
      0,
    );

    // Empréstimos do mês atual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const loansThisMonth = activeLoans.filter((loan) => {
      if (!loan.dataVencimento) return false;
      const date = new Date(loan.dataVencimento);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthlyValue = loansThisMonth.reduce(
      (sum, loan) => sum + Number(loan.valor || 0),
      0,
    );

    // Histórico mensal (últimos 6 meses)
    const monthlyHistory = await this.getMonthlyHistory(userId);

    return {
      totalLoans: activeLoans.length,
      totalToReceive,
      overdueCount: overdueLoans.length,
      overdueValue,
      monthlyValue,
      monthlyHistory,
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

      const monthLoans = loans.filter((loan) => {
        const createdAt = new Date(loan.createdAt);
        return createdAt.getMonth() === month && createdAt.getFullYear() === year;
      });

      const value = monthLoans.reduce(
        (sum, loan) => sum + Number(loan.valor || 0),
        0,
      );

      history.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        value,
      });
    }

    return history;
  }
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum LoanStatus {
  ACTIVE = 'active',
  FINISHED = 'finished',
}

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  // Dados do cliente
  @Column({ nullable: true })
  nome: string;

  @Column({ nullable: true })
  telefone: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  valor: number;

  @Column({ type: 'date', nullable: true })
  dataVencimento: string;

  @Column({ type: 'date', nullable: true })
  dataPagamento: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  valorJurosPago: number; // Valor dos juros pagos

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  valorTotalPago: number; // Valor total pago (principal + juros)

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  juros: number; // Percentual de juros

  @Column({ nullable: true })
  endereco: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({
    type: 'varchar',
    default: LoanStatus.ACTIVE,
  })
  status: LoanStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.loans, { eager: true })
  user: User;
}

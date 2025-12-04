import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Loan } from '../loan/loan.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ nullable: true, type: 'text' })
  photo: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  meta: number;

  @OneToMany(() => Loan, (loan) => loan.user)
  loans: Loan[];
}

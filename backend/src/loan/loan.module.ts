import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './loan.entity';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Loan]), UserModule],
  providers: [LoanService],
  controllers: [LoanController],
})
export class LoanModule {}

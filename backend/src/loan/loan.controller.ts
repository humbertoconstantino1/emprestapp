import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLoanDto, UpdateLoanDto, RenewLoanDto } from './dto/create-loan.dto';

@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoanController {
  constructor(private loanService: LoanService) {}

  @Post()
  create(@Request() req, @Body() createLoanDto: CreateLoanDto) {
    return this.loanService.create(req.user.userId, createLoanDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.loanService.findByUser(req.user.userId);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.loanService.getStats(req.user.userId);
  }

  @Get('active')
  findActive(@Request() req) {
    return this.loanService.findActiveByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.loanService.findOne(+id, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateLoanDto: UpdateLoanDto,
  ) {
    return this.loanService.update(+id, req.user.userId, updateLoanDto);
  }

  @Put(':id/finish')
  finish(@Param('id') id: string, @Request() req) {
    return this.loanService.finish(+id, req.user.userId);
  }

  @Put(':id/renew')
  renew(@Param('id') id: string, @Request() req, @Body() renewLoanDto: RenewLoanDto) {
    return this.loanService.renew(+id, req.user.userId, renewLoanDto.tipoPagamento, renewLoanDto.dataVencimento);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.loanService.remove(+id, req.user.userId);
  }
}

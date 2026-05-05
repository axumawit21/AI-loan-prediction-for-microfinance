import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { LoansService } from './loans.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('loans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoansController {
  constructor(private loansService: LoansService) {}

  @Post()
  @Roles('loan_officer', 'admin')
  async create(@Body() body: any, @Request() req) {
    const loan = await this.loansService.create(body, req.user.userId, req.user.saccoId);
    return {
      success: true,
      message: 'Loan application created successfully',
      data: loan,
    };
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('status') status?: string, @Query('search') search?: string, @Request() req?) {
    const result = await this.loansService.findAll(Number(page), Number(limit), status, search, req?.user?.saccoId);
    return {
      success: true,
      message: 'Loans fetched',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const loan = await this.loansService.findByIdWithDetails(id);
    if (!loan) {
      return {
        success: false,
        message: 'Loan not found',
        data: null,
      };
    }
    return {
      success: true,
      message: 'Loan details',
      data: loan,
    };
  }

  @Patch(':id')
  @Roles('loan_officer', 'admin')
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      const loan = await this.loansService.update(id, body);
      return {
        success: true,
        message: 'Loan updated successfully',
        data: loan,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string) {
    const loan = await this.loansService.delete(id);
    if (!loan) {
      return {
        success: false,
        message: 'Loan not found',
        data: null,
      };
    }
    return {
      success: true,
      message: 'Loan deleted successfully',
      data: loan,
    };
  }
}

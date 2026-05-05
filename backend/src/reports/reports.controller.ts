import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  async getDashboardSummary(@Request() req) {
    const summary = await this.reportsService.getDashboardSummary(req.user.saccoId);
    return {
      success: true,
      message: 'Dashboard summary fetched',
      data: summary,
    };
  }

  @Get('loans')
  async getLoanStats(@Request() req) {
    const stats = await this.reportsService.getLoanStats(req.user.saccoId);
    return {
      success: true,
      message: 'Loan statistics fetched',
      data: stats,
    };
  }

  @Get('clients')
  async getClientStats(@Request() req) {
    const stats = await this.reportsService.getClientStats(req.user.saccoId);
    return {
      success: true,
      message: 'Client statistics fetched',
      data: stats,
    };
  }

  @Get('predictions')
  async getPredictionStats(@Request() req) {
    const stats = await this.reportsService.getPredictionStats(req.user.saccoId);
    return {
      success: true,
      message: 'Prediction statistics fetched',
      data: stats,
    };
  }
}

import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('predictions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PredictionsController {
  constructor(private predictionsService: PredictionsService) {}

  @Post('predict-risk')
  @Roles('loan_officer', 'admin')
  async predictRisk(@Body() body: { loanId: string }) {
    const prediction = await this.predictionsService.predictRisk(body.loanId);
    return {
      success: true,
      message: 'Risk analysis completed',
      data: prediction,
    };
  }

  @Get(':loanId')
  async findByLoanId(@Param('loanId') loanId: string) {
    const prediction = await this.predictionsService.findByLoanId(loanId);
    if (!prediction) {
      return {
        success: false,
        message: 'Prediction not found',
        data: null,
      };
    }
    return {
      success: true,
      message: 'Prediction fetched',
      data: prediction,
    };
  }
}

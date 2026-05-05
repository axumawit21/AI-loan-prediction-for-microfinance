import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() body: any, @Request() req) {
    const decision = await this.reviewsService.create(body, req.user.userId);
    
    await this.reviewsService.updateLoanStatusBasedOnDecision(body.loanId, body.decision);
    
    return {
      success: true,
      message: 'Decision recorded successfully',
      data: decision,
    };
  }

  @Get('loan/:loanId')
  async findByLoanId(@Param('loanId') loanId: string) {
    const decisions = await this.reviewsService.findByLoanId(loanId);
    return {
      success: true,
      message: 'Decisions fetched',
      data: decisions,
    };
  }
}

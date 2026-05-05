import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Decision, DecisionSchema } from './schemas/decision.schema';
import { Loan, LoanSchema } from '../loans/schemas/loan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Decision.name, schema: DecisionSchema },
      { name: Loan.name, schema: LoanSchema },
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}

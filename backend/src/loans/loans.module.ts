import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { Loan, LoanSchema } from './schemas/loan.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { Prediction, PredictionSchema } from '../predictions/schemas/prediction.schema';
import { Decision, DecisionSchema } from '../reviews/schemas/decision.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Loan.name, schema: LoanSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Prediction.name, schema: PredictionSchema },
      { name: Decision.name, schema: DecisionSchema },
    ]),
  ],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}

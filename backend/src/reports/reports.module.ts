import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Loan, LoanSchema } from '../loans/schemas/loan.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';
import { Prediction, PredictionSchema } from '../predictions/schemas/prediction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Loan.name, schema: LoanSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Prediction.name, schema: PredictionSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

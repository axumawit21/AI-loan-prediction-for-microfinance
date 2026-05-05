import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { AIEngineService } from './ai-engine.service';
import { Prediction, PredictionSchema } from './schemas/prediction.schema';
import { Loan, LoanSchema } from '../loans/schemas/loan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prediction.name, schema: PredictionSchema },
      { name: Loan.name, schema: LoanSchema },
    ]),
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService, AIEngineService],
  exports: [PredictionsService, AIEngineService],
})
export class PredictionsModule {}

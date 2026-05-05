import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Prediction, PredictionDocument } from './schemas/prediction.schema';
import { AIEngineService } from './ai-engine.service';
import { Loan } from '../loans/schemas/loan.schema';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectModel(Prediction.name) private predictionModel: Model<PredictionDocument>,
    @InjectModel(Loan.name) private loanModel: Model<Loan>,
    private aiEngine: AIEngineService,
  ) {}

  async predictRisk(loanId: string) {
    const loan = await this.loanModel.findById(loanId).exec();
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const predictionResult = this.aiEngine.predict(loan);

    const prediction = new this.predictionModel({
      loanId: new Types.ObjectId(loanId),
      riskScore: predictionResult.riskScore,
      riskLevel: predictionResult.riskLevel,
      explanation: predictionResult.explanation,
      recommendation: predictionResult.recommendation,
      features: predictionResult.features,
      modelVersion: predictionResult.modelVersion,
    });

    await prediction.save();

    await this.loanModel.findByIdAndUpdate(loanId, { status: 'officer_review' }).exec();

    return prediction;
  }

  async findByLoanId(loanId: string): Promise<PredictionDocument | null> {
    return this.predictionModel.findOne({ loanId }).sort({ createdAt: -1 }).exec();
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PredictionDocument = Prediction & Document;

@Schema({ timestamps: true })
export class Prediction {
  @Prop({ type: Types.ObjectId, ref: 'Loan', required: true })
  loanId: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 100 })
  riskScore: number;

  @Prop({ required: true, enum: ['Low', 'Medium', 'High'] })
  riskLevel: string;

  @Prop({ type: [String] })
  explanation: string[];

  @Prop({ required: true, enum: ['Approve', 'Reject', 'Modify'] })
  recommendation: string;

  @Prop({ type: Object })
  features: Record<string, number>;

  @Prop({ default: '1.0' })
  modelVersion: string;
}

export const PredictionSchema = SchemaFactory.createForClass(Prediction);

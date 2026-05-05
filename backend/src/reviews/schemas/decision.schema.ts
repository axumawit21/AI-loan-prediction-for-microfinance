import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DecisionDocument = Decision & Document;

@Schema({ timestamps: true })
export class Decision {
  @Prop({ type: Types.ObjectId, ref: 'Loan', required: true })
  loanId: Types.ObjectId;

  @Prop({ required: true, enum: ['officer', 'committee'] })
  reviewerType: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reviewerId: Types.ObjectId;

  @Prop({ required: true, enum: ['approve', 'reject', 'send_to_committee', 'request_modification'] })
  decision: string;

  @Prop()
  comment: string;
}

export const DecisionSchema = SchemaFactory.createForClass(Decision);

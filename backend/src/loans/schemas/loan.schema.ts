import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoanDocument = Loan & Document;

@Schema({ timestamps: true })
export class Loan {
  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  clientId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  purpose: string;

  @Prop({ required: true })
  income: number;

  @Prop({ required: true })
  expenses: number;

  @Prop({ required: true })
  totalSavings: number;

  @Prop({ required: true })
  monthlySavings: number;

  @Prop({ required: true })
  membershipDuration: number;

  @Prop({ enum: ['property', 'vehicle', 'savings', 'equipment', 'livestock', 'other', 'none'], default: 'none' })
  collateralType: string;

  @Prop({ default: 0 })
  collateralValue: number;

  @Prop()
  guarantorName: string;

  @Prop()
  guarantorMemberId: string;

  @Prop({ default: 0 })
  guarantorSalary: number;

  @Prop()
  relationship: string;

  @Prop()
  businessType: string;

  @Prop({ default: 0 })
  numberOfDependents: number;

  @Prop({ default: 0 })
  expectedReturn: number;

  @Prop({
    type: String,
    enum: ['pending', 'officer_review', 'committee_review', 'approved', 'rejected', 'modification_requested', 'disbursed', 'closed'],
    default: 'pending'
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedOfficer: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Sacco' })
  saccoId: Types.ObjectId;
}

export const LoanSchema = SchemaFactory.createForClass(Loan);

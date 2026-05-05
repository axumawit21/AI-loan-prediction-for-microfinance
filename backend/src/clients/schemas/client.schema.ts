import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  email: string;

  @Prop()
  address: string;

  @Prop({ enum: ['male', 'female', 'other'] })
  gender: string;

  @Prop()
  dateOfBirth: Date;

  @Prop()
  nationalId: string;

  @Prop()
  businessType: string;

  @Prop({ default: Date.now })
  membershipDate: Date;

  @Prop({ default: 0 })
  totalSavings: number;

  @Prop({ default: 0 })
  monthlySavings: number;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  registeredBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Sacco' })
  saccoId: Types.ObjectId;
}

export const ClientSchema = SchemaFactory.createForClass(Client);

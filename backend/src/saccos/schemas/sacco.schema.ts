import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SaccoDocument = Sacco & Document;

@Schema({ timestamps: true })
export class Sacco {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const SaccoSchema = SchemaFactory.createForClass(Sacco);

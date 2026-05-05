import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sacco, SaccoDocument } from './schemas/sacco.schema';

@Injectable()
export class SaccosService {
  constructor(@InjectModel(Sacco.name) private saccoModel: Model<SaccoDocument>) {}

  async create(data: { name: string }) {
    return this.saccoModel.create(data);
  }

  async findAll() {
    return this.saccoModel.find().sort({ name: 1 });
  }

  async findById(id: string) {
    return this.saccoModel.findById(id);
  }

  async update(id: string, data: Partial<Sacco>) {
    return this.saccoModel.findByIdAndUpdate(id, data, { new: true });
  }
}

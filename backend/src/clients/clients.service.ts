import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';
import { Loan } from '../loans/schemas/loan.schema';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(Loan.name) private loanModel: Model<Loan>,
  ) {}

  async create(clientData: any, registeredBy: string, saccoId?: string): Promise<ClientDocument> {
    const client = new this.clientModel({
      ...clientData,
      registeredBy: new Types.ObjectId(registeredBy),
      ...(saccoId ? { saccoId: new Types.ObjectId(saccoId) } : {}),
    });
    return client.save();
  }

  async findById(id: string): Promise<ClientDocument | null> {
    return this.clientModel.findById(id).populate('registeredBy', '_id name').exec();
  }

  async findAll(page = 1, limit = 10, search?: string, status?: string, saccoId?: string) {
    const query: any = {};
    if (saccoId) {
      query.saccoId = new Types.ObjectId(saccoId);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.clientModel.find(query).skip(skip).limit(limit).exec(),
      this.clientModel.countDocuments(query).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, clientData: any): Promise<ClientDocument | null> {
    return this.clientModel.findByIdAndUpdate(id, clientData, { new: true }).exec();
  }

  async delete(id: string): Promise<ClientDocument | null> {
    return this.clientModel.findByIdAndDelete(id).exec();
  }

  async getLoanHistory(clientId: string) {
    return this.loanModel.find({ clientId }).select('_id amount status purpose createdAt').exec();
  }
}

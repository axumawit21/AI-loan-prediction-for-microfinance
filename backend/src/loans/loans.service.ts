import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Loan, LoanDocument } from './schemas/loan.schema';
import { Client } from '../clients/schemas/client.schema';
import { Prediction } from '../predictions/schemas/prediction.schema';
import { Decision } from '../reviews/schemas/decision.schema';

@Injectable()
export class LoansService {
  constructor(
    @InjectModel(Loan.name) private loanModel: Model<LoanDocument>,
    @InjectModel(Client.name) private clientModel: Model<Client>,
    @InjectModel(Prediction.name) private predictionModel: Model<Prediction>,
    @InjectModel(Decision.name) private decisionModel: Model<Decision>,
  ) {}

  async create(loanData: any, createdBy: string, saccoId?: string): Promise<LoanDocument> {
    const client = await this.clientModel.findById(loanData.clientId).exec();
    if (!client || client.status !== 'active') {
      throw new BadRequestException('Client not found or inactive');
    }

    const loan = new this.loanModel({
      ...loanData,
      clientId: new Types.ObjectId(loanData.clientId),
      status: 'pending',
      createdBy: new Types.ObjectId(createdBy),
      assignedOfficer: new Types.ObjectId(createdBy),
      ...(saccoId ? { saccoId: new Types.ObjectId(saccoId) } : {}),
    });
    return loan.save();
  }

  async findById(id: string): Promise<LoanDocument | null> {
    return this.loanModel
      .findById(id)
      .populate('clientId', '_id name phone totalSavings')
      .populate('assignedOfficer', '_id name')
      .populate('createdBy', '_id name')
      .exec();
  }

  async findByIdWithDetails(id: string) {
    const loan = await this.findById(id);
    if (!loan) {
      return null;
    }

    const prediction = await this.predictionModel.findOne({ loanId: loan._id }).exec();
    const decisions = await this.decisionModel.find({ loanId: loan._id }).populate('reviewerId', '_id name').exec();

    return {
      ...loan.toObject(),
      prediction,
      decisions,
    };
  }

  async findAll(page = 1, limit = 10, status?: string, search?: string, saccoId?: string) {
    const query: any = {};
    if (saccoId) {
      query.saccoId = new Types.ObjectId(saccoId);
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { purpose: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.loanModel
        .find(query)
        .populate('clientId', '_id name phone')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.loanModel.countDocuments(query).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, loanData: any): Promise<LoanDocument | null> {
    const loan = await this.loanModel.findById(id);
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== 'pending' && loan.status !== 'modification_requested') {
      throw new BadRequestException('Cannot edit loan in current status');
    }

    const updateData: any = { ...loanData };
    if (loan.status === 'modification_requested') {
      updateData.status = 'pending';
    }

    return this.loanModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async updateStatus(id: string, status: string): Promise<LoanDocument | null> {
    return this.loanModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async delete(id: string): Promise<LoanDocument | null> {
    return this.loanModel.findByIdAndDelete(id).exec();
  }
}

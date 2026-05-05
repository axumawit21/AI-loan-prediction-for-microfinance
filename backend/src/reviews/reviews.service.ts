import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Decision, DecisionDocument } from './schemas/decision.schema';
import { Loan } from '../loans/schemas/loan.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Decision.name) private decisionModel: Model<DecisionDocument>,
    @InjectModel(Loan.name) private loanModel: Model<Loan>,
  ) {}

  async create(decisionData: any, reviewerId: string): Promise<DecisionDocument> {
    const decision = new this.decisionModel({
      ...decisionData,
      loanId: new Types.ObjectId(decisionData.loanId),
      reviewerId: new Types.ObjectId(reviewerId),
    });
    return decision.save();
  }

  async findByLoanId(loanId: string) {
    return this.decisionModel
      .find({ loanId })
      .populate('reviewerId', '_id name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateLoanStatusBasedOnDecision(loanId: string, decision: string) {
    let newStatus: string;

    switch (decision) {
      case 'approve':
        newStatus = 'approved';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'send_to_committee':
        newStatus = 'committee_review';
        break;
      case 'request_modification':
        newStatus = 'modification_requested';
        break;
      default:
        return null;
    }

    return this.loanModel.findByIdAndUpdate(loanId, { status: newStatus }, { new: true }).exec();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Loan } from '../loans/schemas/loan.schema';
import { Client } from '../clients/schemas/client.schema';
import { Prediction } from '../predictions/schemas/prediction.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Loan.name) private loanModel: Model<Loan>,
    @InjectModel(Client.name) private clientModel: Model<Client>,
    @InjectModel(Prediction.name) private predictionModel: Model<Prediction>,
  ) {}

  private saccoFilter(saccoId?: string) {
    return saccoId ? { saccoId: new Types.ObjectId(saccoId) } : {};
  }

  async getLoanStats(saccoId?: string) {
    const filter = this.saccoFilter(saccoId);

    const [
      totalLoans,
      pendingLoans,
      approvedLoans,
      rejectedLoans,
      totalAmount,
      approvedAmount,
      monthlyTrendRaw,
    ] = await Promise.all([
      this.loanModel.countDocuments(filter).exec(),
      this.loanModel.countDocuments({ ...filter, status: { $in: ['pending', 'officer_review', 'committee_review'] } }).exec(),
      this.loanModel.countDocuments({ ...filter, status: 'approved' }).exec(),
      this.loanModel.countDocuments({ ...filter, status: 'rejected' }).exec(),
      this.loanModel.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: '$amount' } } }]).exec(),
      this.loanModel.aggregate([{ $match: { ...filter, status: 'approved' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]).exec(),
      this.loanModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            total: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]).exec(),
    ]);

    // Format monthly trend as { month: "2026-04", total, approved, rejected }
    const monthlyTrend = monthlyTrendRaw.map((m: any) => ({
      month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      total: m.total,
      approved: m.approved,
      rejected: m.rejected,
    }));

    return {
      totalLoans,
      pendingLoans,
      approvedLoans,
      rejectedLoans,
      totalAmount: totalAmount[0]?.total || 0,
      approvedAmount: approvedAmount[0]?.total || 0,
      monthlyTrend,
    };
  }

  async getClientStats(saccoId?: string) {
    const filter = this.saccoFilter(saccoId);

    const [totalClients, activeClients, totalSavings] = await Promise.all([
      this.clientModel.countDocuments(filter).exec(),
      this.clientModel.countDocuments({ ...filter, status: 'active' }).exec(),
      this.clientModel.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: '$totalSavings' } } }]).exec(),
    ]);

    return {
      totalClients,
      activeClients,
      totalSavings: totalSavings[0]?.total || 0,
    };
  }

  async getPredictionStats(saccoId?: string) {
    // Predictions are linked to loans, so we filter via loan saccoId
    if (saccoId) {
      const loanIds = await this.loanModel.find(this.saccoFilter(saccoId)).distinct('_id').exec();
      const filter = { loanId: { $in: loanIds } };

      const [totalPredictions, lowRisk, mediumRisk, highRisk] = await Promise.all([
        this.predictionModel.countDocuments(filter).exec(),
        this.predictionModel.countDocuments({ ...filter, riskLevel: 'Low' }).exec(),
        this.predictionModel.countDocuments({ ...filter, riskLevel: 'Medium' }).exec(),
        this.predictionModel.countDocuments({ ...filter, riskLevel: 'High' }).exec(),
      ]);

      return { totalPredictions, lowRisk, mediumRisk, highRisk };
    }

    const [totalPredictions, lowRisk, mediumRisk, highRisk] = await Promise.all([
      this.predictionModel.countDocuments().exec(),
      this.predictionModel.countDocuments({ riskLevel: 'Low' }).exec(),
      this.predictionModel.countDocuments({ riskLevel: 'Medium' }).exec(),
      this.predictionModel.countDocuments({ riskLevel: 'High' }).exec(),
    ]);

    return { totalPredictions, lowRisk, mediumRisk, highRisk };
  }

  async getDashboardSummary(saccoId?: string) {
    const [loanStats, clientStats, predictionStats] = await Promise.all([
      this.getLoanStats(saccoId),
      this.getClientStats(saccoId),
      this.getPredictionStats(saccoId),
    ]);

    return {
      loans: loanStats,
      clients: clientStats,
      predictions: predictionStats,
    };
  }
}

import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface ModelWeights {
  weights: Record<string, number>;
  bias: number;
  normalization: Record<string, number>;
  feature_columns: string[];
  accuracy: number;
  model_version: string;
  risk_thresholds: {
    low_max: number;
    medium_max: number;
  };
  collateral_encoding: Record<string, number>;
}

@Injectable()
export class AIEngineService {
  private model: ModelWeights;
  private modelPath: string;

  constructor() {
    this.modelPath = path.join(process.cwd(), 'src/ml/model_weights.json');
    this.loadModel();
  }

  private loadModel() {
    try {
      const modelData = fs.readFileSync(this.modelPath, 'utf8');
      this.model = JSON.parse(modelData);
      console.log('✅ ML Model loaded successfully');
      console.log(`Model version: ${this.model.model_version}, Accuracy: ${this.model.accuracy}, Features: ${this.model.feature_columns.length}`);
    } catch (error) {
      console.error('❌ Failed to load ML model:', error.message);
      throw new Error('ML model not found. Please train the model first.');
    }
  }

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  predict(loanData: any) {
    const {
      income, expenses, totalSavings, monthlySavings,
      membershipDuration, amount, guarantorSalary, collateralValue,
      collateralType, duration, numberOfDependents, expectedReturn
    } = loanData;

    // Derived features
    const disposableIncome = income - expenses;
    const monthlyPayment = amount / Math.max(duration, 1);
    const dti = monthlyPayment / Math.max(income, 1);
    const savingsRatio = totalSavings / Math.max(amount, 1);
    const loanToValue = collateralValue > 0 ? amount / collateralValue : 10.0;
    const guarantorStrength = guarantorSalary / Math.max(monthlyPayment, 1);
    const returnRatio = expectedReturn / Math.max(amount, 1);
    const repaymentCapacity = disposableIncome / Math.max(monthlyPayment, 1);

    // Collateral type encoding
    const collateralEncoding = this.model.collateral_encoding || {
      property: 1.0, vehicle: 0.8, savings: 0.7,
      equipment: 0.5, livestock: 0.4, other: 0.2, none: 0.0,
    };
    const collateralTypeScore = collateralEncoding[collateralType] ?? 0.0;

    // Build feature vector matching model's expected columns
    const features: Record<string, number> = {
      income,
      expenses,
      disposable_income: disposableIncome,
      total_savings: totalSavings || 0,
      monthly_savings: monthlySavings || 0,
      membership_duration: membershipDuration || 0,
      loan_amount: amount,
      duration: duration || 12,
      monthly_payment: monthlyPayment,
      guarantor_salary: guarantorSalary || 0,
      collateral_value: collateralValue || 0,
      num_dependents: numberOfDependents || 0,
      expected_return: expectedReturn || 0,
      collateral_type_score: collateralTypeScore,
      debt_to_income: dti,
      savings_to_loan_ratio: savingsRatio,
      loan_to_value: loanToValue,
      guarantor_strength: guarantorStrength,
      return_ratio: returnRatio,
      repayment_capacity: repaymentCapacity,
    };

    let riskScore: number;
    let riskLevel: string;
    let recommendation: string;

    // CRITICAL FAIL CONDITIONS
    const criticalFails: string[] = [];
    if (monthlyPayment > disposableIncome) criticalFails.push('Monthly payment exceeds disposable income');
    if (dti > 0.5) criticalFails.push(`Debt-to-income ratio too high (${Math.round(dti*100)}%)`);
    if (amount > 3 * (totalSavings || 0)) criticalFails.push('Loan amount exceeds 3x total savings');
    if (!collateralValue || collateralValue <= 0) criticalFails.push('No valid collateral provided');

    if (criticalFails.length > 0) {
      riskScore = 95; // Force high risk
      riskLevel = 'High';
      recommendation = 'Reject';
    } else {
      // Compute logistic regression: z = bias + sum(weight_i * normalized_feature_i)
      let z = this.model.bias;
      for (const col of this.model.feature_columns) {
        const normMax = this.model.normalization[col] || 1;
        const normalizedValue = Math.min((features[col] || 0) / normMax, 1.0);
        z += this.model.weights[col] * normalizedValue;
      }

      const probability = this.sigmoid(z);
      riskScore = Math.round(probability * 100);

      if (riskScore <= this.model.risk_thresholds.low_max) {
        riskLevel = 'Low';
        recommendation = 'Approve';
      } else if (riskScore <= this.model.risk_thresholds.medium_max) {
        riskLevel = 'Medium';
        recommendation = 'Modify';
      } else {
        riskLevel = 'High';
        recommendation = 'Reject';
      }
    }

    const explanation = this.generateExplanation(
      loanData, riskScore, dti, savingsRatio, loanToValue,
      repaymentCapacity, collateralTypeScore, criticalFails
    );

    return {
      riskScore,
      riskLevel,
      explanation,
      recommendation,
      features: {
        disposableIncome,
        monthlyPayment,
        dti: parseFloat(dti.toFixed(2)),
        savingsRatio: parseFloat(savingsRatio.toFixed(2)),
        loanToValue: parseFloat(loanToValue.toFixed(2)),
        repaymentCapacity: parseFloat(repaymentCapacity.toFixed(2)),
        guarantorStrength: parseFloat(guarantorStrength.toFixed(2)),
        returnRatio: parseFloat(returnRatio.toFixed(2))
      },
      modelVersion: this.model.model_version,
    };
  }

  private generateExplanation(
    loanData: any, riskScore: number,
    dti: number, savingsRatio: number, loanToValue: number,
    repaymentCapacity: number, collateralTypeScore: number,
    criticalFails: string[]
  ): string[] {
    const explanation: string[] = [];
    
    // Add critical fails first
    criticalFails.forEach(fail => explanation.push(`❌ Risk: ${fail} (CRITICAL FAIL)`));

    const repPercent = Math.round(repaymentCapacity * 100);
    const dtiPercent = Math.round(dti * 100);
    const savingsPercent = Math.round(savingsRatio * 100);
    const ltvPercent = Math.round(loanToValue * 100);

    // Repayment Capacity
    if (repaymentCapacity >= 3.33) {
      explanation.push(`✅ Good: Excellent repayment capacity (${repaymentCapacity.toFixed(1)}x monthly payment)`);
    } else if (repaymentCapacity >= 1.66) {
      explanation.push(`⚠️ Warning: Moderate repayment capacity (${repaymentCapacity.toFixed(1)}x monthly payment)`);
    } else {
      explanation.push(`❌ Risk: Poor repayment capacity (${repaymentCapacity.toFixed(1)}x monthly payment)`);
    }

    // DTI
    if (dti <= 0.3) {
      explanation.push(`✅ Good: Healthy debt-to-income ratio (${dtiPercent}%)`);
    } else if (dti <= 0.5) {
      explanation.push(`⚠️ Warning: Borderline debt-to-income ratio (${dtiPercent}%)`);
    } else {
      explanation.push(`❌ Risk: High debt-to-income ratio (${dtiPercent}%)`);
    }

    // Savings
    if (savingsRatio >= 1.0) {
      explanation.push(`✅ Good: Strong savings coverage (${savingsPercent}%)`);
    } else if (savingsRatio >= 0.5) {
      explanation.push(`⚠️ Warning: Moderate savings coverage (${savingsPercent}%)`);
    } else {
      explanation.push(`❌ Risk: Low savings relative to loan (${savingsPercent}%)`);
    }

    // Collateral LTV
    if (loanToValue <= 0.3) {
      explanation.push(`✅ Good: Strong collateral coverage (LTV ${ltvPercent}%)`);
    } else if (loanToValue <= 0.6) {
      explanation.push(`⚠️ Warning: Moderate collateral coverage (LTV ${ltvPercent}%)`);
    } else {
      explanation.push(`❌ Risk: Weak collateral coverage (LTV ${ltvPercent}%)`);
    }

    return explanation;
  }
}

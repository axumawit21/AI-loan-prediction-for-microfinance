# -*- coding: utf-8 -*-
"""
SACCO Loan Default Prediction - Expert Rules Hybrid v4.0
=====================================================================
Fixes class imbalance, strictly aligns feature correlations (e.g., 
higher repayment_capacity -> lower risk), and incorporates hard 
fintech rules into the training data generation.
"""

import pandas as pd
import numpy as np
import json
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    roc_auc_score, f1_score
)

np.random.seed(42)

# 1. Borrower Archetypes (Realistic baselines)
ARCHETYPES = {
    'civil_servant': {
        'count': 300,
        'income': (20000, 50000),
        'expense_ratio': (0.30, 0.50),
        'savings_range': (50000, 200000),
        'loan_range': (50000, 300000),
        'duration_range': (12, 36),
        'guarantor_prob': 0.90,
        'collateral_coverage': (1.0, 2.5),
        'base_default_rate': 0.05
    },
    'small_trader': {
        'count': 400,
        'income': (15000, 40000),
        'expense_ratio': (0.40, 0.60),
        'savings_range': (20000, 100000),
        'loan_range': (50000, 250000),
        'duration_range': (6, 24),
        'guarantor_prob': 0.70,
        'collateral_coverage': (0.5, 1.5),
        'base_default_rate': 0.15
    },
    'farmer': {
        'count': 300,
        'income': (8000, 25000),
        'expense_ratio': (0.30, 0.50),
        'savings_range': (10000, 80000),
        'loan_range': (20000, 150000),
        'duration_range': (6, 18),
        'guarantor_prob': 0.60,
        'collateral_coverage': (0.3, 1.2),
        'base_default_rate': 0.20
    },
    'micro_entrepreneur': {
        'count': 300,
        'income': (25000, 70000),
        'expense_ratio': (0.40, 0.65),
        'savings_range': (40000, 250000),
        'loan_range': (100000, 500000),
        'duration_range': (12, 48),
        'guarantor_prob': 0.80,
        'collateral_coverage': (0.8, 2.0),
        'base_default_rate': 0.10
    },
    'daily_laborer': {
        'count': 200,
        'income': (5000, 12000),
        'expense_ratio': (0.70, 0.90),
        'savings_range': (2000, 15000),
        'loan_range': (10000, 50000),
        'duration_range': (3, 12),
        'guarantor_prob': 0.30,
        'collateral_coverage': (0.0, 0.5),
        'base_default_rate': 0.35
    }
}

# 2. Synthetic Data Generation with Strict Rules
def generate_dataset():
    records = []
    
    for archetype, config in ARCHETYPES.items():
        for _ in range(config['count']):
            income = int(np.random.uniform(*config['income']))
            expenses = int(income * np.random.uniform(*config['expense_ratio']))
            disposable_income = income - expenses
            
            total_savings = int(np.random.uniform(*config['savings_range']))
            loan_amount = int(np.random.uniform(*config['loan_range']))
            duration = int(np.random.uniform(*config['duration_range']))
            
            monthly_payment = loan_amount / duration
            
            # Guarantor & Collateral
            has_guarantor = np.random.random() < config['guarantor_prob']
            guarantor_salary = int(income * np.random.uniform(0.5, 1.5)) if has_guarantor else 0
            
            collateral_value = int(loan_amount * np.random.uniform(*config['collateral_coverage']))
            
            # Expected return (mostly positive, some negative)
            expected_return = int(loan_amount * np.random.uniform(0.5, 3.0))

            # Core Metrics Calculation (as defined by user)
            debt_to_income = monthly_payment / income if income > 0 else 1.0
            savings_to_loan_ratio = total_savings / loan_amount if loan_amount > 0 else 0.0
            loan_to_value = loan_amount / collateral_value if collateral_value > 0 else 10.0
            repayment_capacity = disposable_income / monthly_payment if monthly_payment > 0 else 0.0
            
            # Probability calculation (Expert Weights)
            # Repayment Capacity (40%) - higher capacity = lower risk
            if repayment_capacity >= 3.33: rep_score = 0     # monthlyPayment <= 30% of disposable
            elif repayment_capacity >= 1.66: rep_score = 50  # 30-60%
            else: rep_score = 100                            # >60%
            
            # Income Stability (15%) - higher expected return = lower risk
            return_ratio = expected_return / loan_amount if loan_amount > 0 else 0
            if return_ratio >= 1.5: inc_score = 0
            elif return_ratio >= 1.0: inc_score = 50
            else: inc_score = 100
            
            # Savings Ratio (15%) - higher savings = lower risk
            if savings_to_loan_ratio >= 1.0: sav_score = 0
            elif savings_to_loan_ratio >= 0.5: sav_score = 50
            else: sav_score = 100
            
            # Collateral LTV (15%) - lower LTV = lower risk
            if loan_to_value <= 0.30: col_score = 0
            elif loan_to_value <= 0.60: col_score = 50
            else: col_score = 100
            
            # Guarantor Strength (10%)
            guar_ratio = guarantor_salary / monthly_payment if monthly_payment > 0 else 0
            if guar_ratio >= 2.0: gua_score = 0
            elif guar_ratio >= 1.0: gua_score = 50
            else: gua_score = 100
            
            # Membership (5%) - random mock
            mem_score = 50

            # Calculate total weighted score (0 to 100)
            weighted_risk = (
                (rep_score * 0.40) +
                (inc_score * 0.15) +
                (sav_score * 0.15) +
                (col_score * 0.15) +
                (gua_score * 0.10) +
                (mem_score * 0.05)
            )
            
            # Convert score to probability + base rate noise
            prob = (weighted_risk / 100.0) * 0.8 + config['base_default_rate'] * 0.2
            
            # CRITICAL FAIL CONDITIONS (Hard overrides to 100% risk)
            if monthly_payment > disposable_income: prob = 1.0
            if debt_to_income > 0.5: prob = 1.0
            if loan_amount > 3 * total_savings: prob = 1.0
            if collateral_value <= 0: prob = 1.0
            
            # Label generation
            # Introduce a tiny bit of randomness, but heavily skew by probability
            defaulted = 1 if np.random.random() < prob else 0
            
            records.append({
                'income': income,
                'expenses': expenses,
                'disposable_income': disposable_income,
                'total_savings': total_savings,
                'loan_amount': loan_amount,
                'duration': duration,
                'monthly_payment': monthly_payment,
                'guarantor_salary': guarantor_salary,
                'collateral_value': collateral_value,
                'expected_return': expected_return,
                
                # Engineered Features
                'debt_to_income': debt_to_income,
                'savings_to_loan_ratio': savings_to_loan_ratio,
                'loan_to_value': loan_to_value,
                'repayment_capacity': repayment_capacity,
                
                'default_probability': round(prob, 4),
                'defaulted': defaulted,
                'borrower_type': archetype
            })

    df = pd.DataFrame(records).sample(frac=1, random_state=42).reset_index(drop=True)
    return df


print("=" * 60)
print("SACCO Expert ML Pipeline - Fixing Imbalance & Correlations")
print("=" * 60)

df = generate_dataset()

# Print balance stats
default_rate = df['defaulted'].mean()
print(f"Dataset Size: {len(df)}")
print(f"Default Rate: {default_rate:.2%} (Target: 30-50%)")

# Define exactly which features the ML model will learn from
feature_columns = [
    'income', 'expenses', 'disposable_income', 'total_savings',
    'loan_amount', 'duration', 'monthly_payment', 'guarantor_salary',
    'collateral_value', 'expected_return',
    'debt_to_income', 'savings_to_loan_ratio', 'loan_to_value', 
    'repayment_capacity'
]

X = df[feature_columns].values.copy()
y = df['defaulted'].values

# Normalize using max limits
normalization = {}
for i, col in enumerate(feature_columns):
    col_max = float(X[:, i].max())
    if col_max == 0: col_max = 1.0
    normalization[col] = round(col_max, 2)
    X[:, i] = X[:, i] / col_max

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

# Train Model with balanced class weights
model = LogisticRegression(
    class_weight='balanced',
    max_iter=2000,
    random_state=42,
    solver='lbfgs'
)
model.fit(X_train, y_train)

# Evaluation
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)
f1 = f1_score(y_test, y_pred)

print(f"\n[EVALUATION]")
print(f"Accuracy: {accuracy:.4f}")
print(f"ROC-AUC:  {roc_auc:.4f}")
print(f"F1-Score: {f1:.4f}")
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Interpretation (Feature Importance)
print("\n[FEATURE IMPORTANCE & CORRELATION]")
print("(Negative = Decreases Risk ✅, Positive = Increases Risk ❌)")
feature_importance = sorted(
    zip(feature_columns, model.coef_[0]),
    key=lambda x: abs(x[1]),
    reverse=True
)

for feat, coef in feature_importance:
    direction = "INCREASES RISK" if coef > 0 else "DECREASES RISK"
    print(f"  {feat:>25s}: {coef:>+8.4f} -> {direction}")

# Export
weights = {col: round(float(model.coef_[0][i]), 6) for i, col in enumerate(feature_columns)}

output = {
    "weights": weights,
    "bias": round(float(model.intercept_[0]), 6),
    "normalization": normalization,
    "feature_columns": feature_columns,
    "accuracy": round(accuracy, 4),
    "roc_auc": round(roc_auc, 4),
    "f1_score": round(f1, 4),
    "model_version": "4.0",
    "risk_thresholds": {"low_max": 30, "medium_max": 50}
}

weights_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'model_weights.json')
with open(weights_path, 'w') as f:
    json.dump(output, f, indent=2)

print(f"\n✅ Weights saved to {weights_path}")

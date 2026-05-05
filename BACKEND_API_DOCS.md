# Backend API & AI Documentation — SACCO Loan Decision Support System

> **For:** Backend Developer  
> **Stack:** NestJS + MongoDB + Mongoose  
> **Base URL:** `http://localhost:5000/api`  
> **Last Updated:** April 19, 2026

---

## Table of Contents

1. [General Rules](#1-general-rules)
2. [Project Setup](#2-project-setup)
3. [Database Collections & Schemas](#3-database-collections--schemas)
4. [Authentication API](#4-authentication-api)
5. [Clients API](#5-clients-api)
6. [Loans API](#6-loans-api)
7. [AI Prediction API](#7-ai-prediction-api)
8. [AI Model — Dataset & Training](#8-ai-model--dataset--training)
9. [Reviews API](#9-reviews-api)
10. [Reports API](#10-reports-api)
11. [Users API (Admin)](#11-users-api-admin)
12. [Status Flow & Business Rules](#12-status-flow--business-rules)
13. [Seed Data](#13-seed-data)
14. [Build Phases](#14-build-phases)

---

## 1. General Rules

> **CRITICAL:** These rules MUST be followed exactly for seamless frontend-backend integration.

### 1.1 Universal Response Format

Every single API endpoint MUST return this exact JSON structure:

```json
{
  "success": true,
  "message": "Description of what happened",
  "data": {}
}
```

For errors:
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### 1.2 Field Naming Convention

Use **camelCase** everywhere. The frontend uses these **exact** field names. Any deviation will break integration.

| ✅ Correct | ❌ Wrong |
|-----------|---------|
| `totalSavings` | `total_savings`, `savingsTotal` |
| `monthlySavings` | `monthly_savings` |
| `riskScore` | `risk_score` |
| `collateralValue` | `collateral_value` |
| `membershipDuration` | `membership_duration` |
| `guarantorName` | `guarantor_name` |
| `guarantorSalary` | `guarantor_salary` |
| `guarantorMemberId` | `guarantor_member_id` |
| `businessType` | `business_type` |
| `businessDescription` | `business_description` |
| `expectedReturn` | `expected_return` |
| `loanId` | `loan_id` |
| `clientId` | `client_id` |
| `createdAt` | `created_at` |
| `collateralType` | `collateral_type` |
| `riskLevel` | `risk_level` |
| `reviewerType` | `reviewer_type` |
| `reviewerId` | `reviewer_id` |
| `assignedOfficer` | `assigned_officer` |
| `isActive` | `is_active` |

### 1.3 Authentication

- Use JWT Bearer tokens
- Frontend sends: `Authorization: Bearer <token>`
- JWT payload must contain: `{ userId, role, name, email }`
- Token expiry: 24 hours

### 1.4 Pagination (for list endpoints)

Support query params: `?page=1&limit=10&search=keyword`

Return paginated response:
```json
{
  "success": true,
  "message": "Fetched successfully",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### 1.5 CORS

Enable CORS for `http://localhost:5173` (Vite dev server) during development.

### 1.6 Error Handling

- Validation errors → `400` with clear message
- Authentication errors → `401`
- Authorization errors → `403`
- Not found → `404`
- Server errors → `500`
- All errors follow the same `{ success, message, data }` format

---

## 2. Project Setup

### 2.1 Required Dependencies

```bash
# NestJS core
npm install @nestjs/common @nestjs/core @nestjs/platform-express

# Database
npm install @nestjs/mongoose mongoose

# Authentication  
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
npm install -D @types/passport-jwt @types/bcryptjs

# Validation
npm install class-validator class-transformer

# Config
npm install @nestjs/config

# CORS is built into NestJS
```

### 2.2 Environment Variables (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sacco_loans
JWT_SECRET=sacco_loan_system_jwt_secret_2024
JWT_EXPIRES_IN=24h
```

### 2.3 Module Structure

```
src/
├── app.module.ts
├── main.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── clients/
│   ├── clients.module.ts
│   ├── clients.controller.ts
│   ├── clients.service.ts
│   └── schemas/client.schema.ts
├── loans/
│   ├── loans.module.ts
│   ├── loans.controller.ts
│   ├── loans.service.ts
│   └── schemas/loan.schema.ts
├── predictions/
│   ├── predictions.module.ts
│   ├── predictions.controller.ts
│   ├── predictions.service.ts
│   ├── ai-engine.service.ts          ← ML model loading & prediction
│   └── schemas/prediction.schema.ts
├── reviews/
│   ├── reviews.module.ts
│   ├── reviews.controller.ts
│   ├── reviews.service.ts
│   └── schemas/decision.schema.ts
├── reports/
│   ├── reports.module.ts
│   ├── reports.controller.ts
│   └── reports.service.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── schemas/user.schema.ts
├── ml/
│   ├── train.py                      ← Python training script
│   ├── model_weights.json            ← Trained model output
│   └── dataset/
│       └── sacco_loans.csv           ← Sample training dataset
└── seeders/
    └── seed.ts
```

---

## 3. Database Collections & Schemas

### users
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },         // hashed with bcrypt (12 rounds)
  role: { type: String, enum: ['admin', 'loan_officer', 'committee', 'manager'], required: true },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: Date,       // Mongoose timestamps
  updatedAt: Date
}
```

### clients
```javascript
{
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  address: String,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  dateOfBirth: Date,
  nationalId: String,
  businessType: String,
  membershipDate: { type: Date, default: Date.now },
  totalSavings: { type: Number, default: 0 },
  monthlySavings: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  registeredBy: { type: ObjectId, ref: 'User' },
  createdAt: Date,
  updatedAt: Date
}
```

### loans
```javascript
{
  clientId: { type: ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true },
  duration: { type: Number, required: true },               // in months
  purpose: { type: String, required: true },
  income: { type: Number, required: true },
  expenses: { type: Number, required: true },
  totalSavings: { type: Number, required: true },
  monthlySavings: { type: Number, required: true },
  membershipDuration: { type: Number, required: true },     // in months
  collateralType: { type: String, enum: ['property', 'vehicle', 'savings', 'equipment', 'livestock', 'other', 'none'], default: 'none' },
  collateralValue: { type: Number, default: 0 },
  guarantorName: String,
  guarantorMemberId: String,
  guarantorSalary: { type: Number, default: 0 },
  relationship: String,
  businessType: String,
  businessDescription: String,
  expectedReturn: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'officer_review', 'committee_review', 'approved', 'rejected', 'modification_requested', 'disbursed', 'closed'],
    default: 'pending'
  },
  assignedOfficer: { type: ObjectId, ref: 'User' },
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: Date,
  updatedAt: Date
}
```

### predictions
```javascript
{
  loanId: { type: ObjectId, ref: 'Loan', required: true },
  riskScore: { type: Number, required: true, min: 0, max: 100 },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  explanation: [String],          // array of human-readable explanation strings
  recommendation: { type: String, enum: ['Approve', 'Reject', 'Modify'], required: true },
  features: { type: Mixed },     // input features used for prediction (for audit)
  modelVersion: { type: String, default: '1.0' },
  createdAt: Date,
  updatedAt: Date
}
```

### decisions
```javascript
{
  loanId: { type: ObjectId, ref: 'Loan', required: true },
  reviewerType: { type: String, enum: ['officer', 'committee'], required: true },
  reviewerId: { type: ObjectId, ref: 'User', required: true },
  decision: { type: String, enum: ['approve', 'reject', 'send_to_committee', 'request_modification'], required: true },
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 4. Authentication API

### POST `/api/auth/login`

**Public** — no token needed.

**Request Body:**
```json
{
  "email": "officer@sacco.com",
  "password": "officer123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "663a1b2c...",
      "name": "Abebe Kebede",
      "email": "officer@sacco.com",
      "role": "loan_officer",
      "phone": "+251911234567"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null
}
```

**Implementation Notes:**
1. Find user by email
2. Compare password with bcrypt
3. Generate JWT with `{ userId: user._id, role, name, email }`
4. Return token + user (exclude password from user object)

---

### POST `/api/auth/register`

**Roles:** `admin` only

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Abebe Kebede",
  "email": "officer@sacco.com",
  "password": "officer123",
  "role": "loan_officer",
  "phone": "+251911234567"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "663a1b2c...",
    "name": "Abebe Kebede",
    "email": "officer@sacco.com",
    "role": "loan_officer"
  }
}
```

---

### GET `/api/auth/me`

**Headers:** `Authorization: Bearer <token>`

Returns current authenticated user's profile.

**Response (200):**
```json
{
  "success": true,
  "message": "User profile",
  "data": {
    "_id": "663a1b2c...",
    "name": "Abebe Kebede",
    "email": "officer@sacco.com",
    "role": "loan_officer",
    "phone": "+251911234567"
  }
}
```

---

## 5. Clients API

All endpoints require authentication (`Authorization: Bearer <token>`).

### POST `/api/clients`

**Roles:** `loan_officer`, `admin`

**Request Body:**
```json
{
  "name": "Tigist Haile",
  "phone": "+251922345678",
  "email": "tigist@email.com",
  "address": "Addis Ababa, Bole",
  "gender": "female",
  "dateOfBirth": "1990-05-15",
  "nationalId": "ETH-1234567890",
  "businessType": "Retail Trade",
  "totalSavings": 45000,
  "monthlySavings": 3000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Client registered successfully",
  "data": {
    "_id": "663b...",
    "name": "Tigist Haile",
    "phone": "+251922345678",
    "membershipDate": "2024-01-15T00:00:00Z",
    "totalSavings": 45000,
    "status": "active",
    "registeredBy": "663a1b2c..."
  }
}
```

**Implementation:** Set `registeredBy` to the authenticated user's ID.

---

### GET `/api/clients`

**Query Params:** `?page=1&limit=10&search=tigist&status=active`

- `search` filters by name or phone (case-insensitive)
- `status` filters by 'active' or 'inactive'

**Response (200):**
```json
{
  "success": true,
  "message": "Clients fetched",
  "data": {
    "items": [
      {
        "_id": "663b...",
        "name": "Tigist Haile",
        "phone": "+251922345678",
        "businessType": "Retail Trade",
        "totalSavings": 45000,
        "monthlySavings": 3000,
        "membershipDate": "2024-01-15T00:00:00Z",
        "status": "active"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### GET `/api/clients/:id`

Returns full client details **with loan history**.

**Implementation:** 
1. Find client by ID, populate `registeredBy` with `{ _id, name }`
2. Find all loans where `clientId = id`, return `[ { _id, amount, status, purpose, createdAt } ]`

**Response (200):**
```json
{
  "success": true,
  "message": "Client details",
  "data": {
    "_id": "663b...",
    "name": "Tigist Haile",
    "phone": "+251922345678",
    "email": "tigist@email.com",
    "address": "Addis Ababa, Bole",
    "gender": "female",
    "dateOfBirth": "1990-05-15",
    "nationalId": "ETH-1234567890",
    "businessType": "Retail Trade",
    "membershipDate": "2024-01-15T00:00:00Z",
    "totalSavings": 45000,
    "monthlySavings": 3000,
    "status": "active",
    "registeredBy": { "_id": "663a...", "name": "Abebe Kebede" },
    "loans": [
      {
        "_id": "663c...",
        "amount": 50000,
        "status": "approved",
        "purpose": "Business Expansion",
        "createdAt": "2024-05-10T00:00:00Z"
      }
    ]
  }
}
```

---

### PATCH `/api/clients/:id`

**Request Body:** (only fields to update)
```json
{
  "totalSavings": 55000,
  "phone": "+251922345679"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": { /* updated client object */ }
}
```

---

## 6. Loans API

### POST `/api/loans`

**Roles:** `loan_officer`, `admin`

**Request Body:**
```json
{
  "clientId": "663b...",
  "amount": 100000,
  "duration": 12,
  "purpose": "Business Expansion",
  "income": 15000,
  "expenses": 8000,
  "totalSavings": 45000,
  "monthlySavings": 3000,
  "membershipDuration": 24,
  "collateralType": "property",
  "collateralValue": 200000,
  "guarantorName": "Mulugeta Tadesse",
  "guarantorMemberId": "MEM-0045",
  "guarantorSalary": 12000,
  "relationship": "Business Partner",
  "businessType": "Retail Trade",
  "businessDescription": "Expanding existing clothing shop in Merkato",
  "expectedReturn": 25000
}
```

**Implementation:**
1. Validate client exists and is `active`
2. Set `status = 'pending'`
3. Set `createdBy` and `assignedOfficer` to authenticated user's ID

**Response (201):**
```json
{
  "success": true,
  "message": "Loan application created successfully",
  "data": {
    "_id": "663c...",
    "clientId": "663b...",
    "amount": 100000,
    "status": "pending",
    "createdAt": "2024-05-10T00:00:00Z"
  }
}
```

---

### GET `/api/loans`

**Query Params:** `?page=1&limit=10&status=pending&search=tigist`

- `search` filters by client name or purpose
- `status` filters by loan status

**Implementation:** Populate `clientId` with `{ _id, name, phone }`

**Response (200):**
```json
{
  "success": true,
  "message": "Loans fetched",
  "data": {
    "items": [
      {
        "_id": "663c...",
        "clientId": { "_id": "663b...", "name": "Tigist Haile", "phone": "+251922345678" },
        "amount": 100000,
        "duration": 12,
        "purpose": "Business Expansion",
        "status": "pending",
        "createdAt": "2024-05-10T00:00:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

### GET `/api/loans/:id`

Returns **full loan details** with populated client, prediction, and decisions.

**Implementation:**
1. Find loan, populate `clientId` with `{ _id, name, phone, totalSavings }`
2. Populate `assignedOfficer` and `createdBy` with `{ _id, name }`
3. Find latest prediction for this loan
4. Find all decisions for this loan, populate `reviewerId` with `{ _id, name }`

**Response (200):**
```json
{
  "success": true,
  "message": "Loan details",
  "data": {
    "_id": "663c...",
    "clientId": { "_id": "663b...", "name": "Tigist Haile", "phone": "...", "totalSavings": 45000 },
    "amount": 100000,
    "duration": 12,
    "purpose": "Business Expansion",
    "income": 15000,
    "expenses": 8000,
    "totalSavings": 45000,
    "monthlySavings": 3000,
    "membershipDuration": 24,
    "collateralType": "property",
    "collateralValue": 200000,
    "guarantorName": "Mulugeta Tadesse",
    "guarantorMemberId": "MEM-0045",
    "guarantorSalary": 12000,
    "relationship": "Business Partner",
    "businessType": "Retail Trade",
    "businessDescription": "Expanding existing clothing shop in Merkato",
    "expectedReturn": 25000,
    "status": "officer_review",
    "assignedOfficer": { "_id": "663a...", "name": "Abebe Kebede" },
    "createdBy": { "_id": "663a...", "name": "Abebe Kebede" },
    "prediction": {
      "riskScore": 28,
      "riskLevel": "Low",
      "explanation": ["Strong savings-to-loan ratio (45%)", "..."],
      "recommendation": "Approve"
    },
    "decisions": [
      {
        "reviewerType": "officer",
        "reviewerId": { "_id": "663a...", "name": "Abebe Kebede" },
        "decision": "send_to_committee",
        "comment": "Good application, need committee confirmation",
        "createdAt": "2024-05-11T00:00:00Z"
      }
    ],
    "createdAt": "2024-05-10T00:00:00Z",
    "updatedAt": "2024-05-11T00:00:00Z"
  }
}
```

---

### PATCH `/api/loans/:id`

**Roles:** `loan_officer`, `admin`

> This endpoint is used for two scenarios:
> 1. Minor edits before AI analysis (status = `pending`)
> 2. **Modification resubmit** — when committee requested modification (status = `modification_requested`)

**Request Body:** (only fields to update)
```json
{
  "amount": 80000,
  "collateralValue": 250000
}
```

**Business Logic:**
- Only allow edits when loan status is `pending` or `modification_requested`
- If status is `modification_requested` → reset status to `pending` after update (so AI can re-run)
- If status is anything else → return 400 error: "Cannot edit loan in current status"
- This enables the full modification cycle: committee requests changes → officer edits → AI re-runs → officer reviews → committee decides again

**Response (200):**
```json
{
  "success": true,
  "message": "Loan updated successfully",
  "data": { /* updated loan object */ }
}
```

---

## 7. AI Prediction API

### POST `/api/predictions/predict-risk`

**Roles:** `loan_officer`, `admin`

Triggers AI risk analysis on a loan application.

**Request Body:**
```json
{
  "loanId": "663c..."
}
```

**Implementation Steps:**
1. Fetch the loan by ID
2. Extract the 10 input features
3. Normalize features
4. Load trained model weights from `model_weights.json`
5. Run logistic regression: `z = bias + Σ(weight × feature)`
6. Calculate `riskScore = sigmoid(z) × 100`
7. Determine `riskLevel` and `recommendation`
8. Generate human-readable `explanation` array
9. Save prediction to `predictions` collection
10. Update loan status from `pending` → `officer_review`
11. Return the prediction

**Response (200):**
```json
{
  "success": true,
  "message": "Risk analysis completed",
  "data": {
    "_id": "663d...",
    "loanId": "663c...",
    "riskScore": 28,
    "riskLevel": "Low",
    "explanation": [
      "Healthy debt-to-income ratio (53%)",
      "Strong savings-to-loan ratio (45%)",
      "Collateral covers 200% of loan value",
      "Solid membership history (24 months)",
      "Guarantor salary sufficient (12,000 ETB)"
    ],
    "recommendation": "Approve",
    "features": {
      "income": 15000,
      "expenses": 8000,
      "totalSavings": 45000,
      "monthlySavings": 3000,
      "membershipDuration": 24,
      "loanAmount": 100000,
      "collateralValue": 200000,
      "guarantorSalary": 12000,
      "dti": 0.53,
      "savingsRatio": 0.45,
      "collateralCoverage": 2.0
    },
    "modelVersion": "1.0"
  }
}
```

---

### GET `/api/predictions/:loanId`

Get saved prediction for a specific loan.

**Response (200):**
```json
{
  "success": true,
  "message": "Prediction fetched",
  "data": {
    "_id": "663d...",
    "loanId": "663c...",
    "riskScore": 28,
    "riskLevel": "Low",
    "explanation": ["..."],
    "recommendation": "Approve",
    "modelVersion": "1.0",
    "createdAt": "2024-05-10T10:00:00Z"
  }
}
```

---

## 8. AI Model — Dataset & Training

> **This is the most important section for the AI component of this project.**

### 8.1 Overview

The system uses a **Logistic Regression** model trained on a sample dataset of SACCO loan records. The model predicts **default probability** (0 = will repay, 1 = will default). The backend loads the trained model weights and uses them for real-time prediction.

### Dataset Strategy

> **Development/Demo:** Use a **sample (synthetic) dataset** of 200–500 rows generated with realistic Ethiopian financial patterns. This is for training the initial model and demonstrating the system.
>
> **Production:** The model will be **retrained on real historical SACCO loan data** — actual past loans with known repayment outcomes. The SACCO provides their historical records, which are formatted into the same CSV structure, and the Python training script is re-run to produce updated model weights. This ensures predictions reflect real-world patterns specific to that SACCO's membership base.

### 8.2 Sample Dataset Structure

Create a CSV file at `src/ml/dataset/sacco_loans.csv` with **at least 200–500 rows**. Each row represents a historical loan application with a known outcome.

**CSV Columns:**

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `income` | Number | Monthly income in ETB | 15000 |
| `expenses` | Number | Monthly expenses in ETB | 8000 |
| `total_savings` | Number | Total savings in ETB | 45000 |
| `monthly_savings` | Number | Monthly savings in ETB | 3000 |
| `membership_duration` | Number | Months as SACCO member | 24 |
| `loan_amount` | Number | Requested loan amount in ETB | 100000 |
| `guarantor_salary` | Number | Guarantor monthly salary in ETB | 12000 |
| `collateral_value` | Number | Collateral value in ETB | 200000 |
| `has_guarantor` | 0/1 | Whether guarantor exists | 1 |
| `collateral_type` | String | Type of collateral | property |
| `defaulted` | 0/1 | **Target variable**: 1 = defaulted, 0 = repaid | 0 |

### 8.3 Sample Data Generation Rules

Generate realistic Ethiopian SACCO data using these patterns:

**Low Risk (defaulted = 0, ~60% of dataset):**
- Income: 10,000–60,000 ETB
- Expenses: 30–50% of income
- Savings: 40–100% of loan amount
- Membership: 12–60 months
- Has guarantor with salary > 50% of borrower income
- Has collateral covering > 80% of loan

**Medium Risk (mixed 0/1, ~25% of dataset):**
- Income: 5,000–20,000 ETB
- Expenses: 50–65% of income
- Savings: 20–40% of loan amount
- Membership: 6–24 months
- May or may not have guarantor
- Collateral covers 30–80% of loan

**High Risk (defaulted = 1, ~15% of dataset):**
- Income: 3,000–10,000 ETB
- Expenses: 65–85% of income
- Savings: < 20% of loan amount
- Membership: < 12 months
- No guarantor or guarantor with low salary
- No collateral or collateral < 30% of loan

### 8.4 Python Training Script

Create `src/ml/train.py`:

```python
"""
SACCO Loan Default Prediction Model Trainer
Uses Logistic Regression with scikit-learn
Outputs model weights to model_weights.json
"""

import pandas as pd
import numpy as np
import json
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# ──────────────────────────────────────────────
# 1. Load Dataset
# ──────────────────────────────────────────────
df = pd.read_csv('dataset/sacco_loans.csv')
print(f"Dataset loaded: {len(df)} records")
print(f"Default rate: {df['defaulted'].mean():.2%}")

# ──────────────────────────────────────────────
# 2. Feature Engineering
# ──────────────────────────────────────────────
df['dti'] = df['expenses'] / df['income']                    # Debt-to-income ratio
df['savings_ratio'] = (df['total_savings'] / df['loan_amount']).clip(upper=1.0)  # Savings-to-loan
df['collateral_coverage'] = (df['collateral_value'] / df['loan_amount']).clip(upper=3.0)

# Feature columns for training
feature_columns = [
    'income', 'expenses', 'total_savings', 'monthly_savings',
    'membership_duration', 'loan_amount', 'guarantor_salary',
    'collateral_value', 'dti', 'savings_ratio'
]

X = df[feature_columns].values
y = df['defaulted'].values

# ──────────────────────────────────────────────
# 3. Normalize Features
# ──────────────────────────────────────────────
# Store normalization ranges for the backend
normalization = {}
for i, col in enumerate(feature_columns):
    col_max = float(X[:, i].max())
    if col_max == 0:
        col_max = 1.0
    normalization[col] = col_max
    X[:, i] = X[:, i] / col_max

# ──────────────────────────────────────────────
# 4. Train/Test Split
# ──────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ──────────────────────────────────────────────
# 5. Train Logistic Regression
# ──────────────────────────────────────────────
model = LogisticRegression(
    max_iter=1000,
    random_state=42,
    class_weight='balanced'  # handle imbalanced data
)
model.fit(X_train, y_train)

# ──────────────────────────────────────────────
# 6. Evaluate
# ──────────────────────────────────────────────
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\nAccuracy: {accuracy:.2%}")
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Repaid', 'Defaulted']))
print(f"Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# ──────────────────────────────────────────────
# 7. Export Model Weights
# ──────────────────────────────────────────────
weights = {}
for i, col in enumerate(feature_columns):
    weights[col] = round(float(model.coef_[0][i]), 6)

model_output = {
    "weights": weights,
    "bias": round(float(model.intercept_[0]), 6),
    "normalization": normalization,
    "feature_columns": feature_columns,
    "accuracy": round(accuracy, 4),
    "model_version": "1.0",
    "risk_thresholds": {
        "low_max": 35,
        "medium_max": 65
    }
}

with open('model_weights.json', 'w') as f:
    json.dump(model_output, f, indent=2)

print(f"\n✅ Model weights saved to model_weights.json")
print(f"Weights: {weights}")
print(f"Bias: {model_output['bias']}")
```

### 8.5 Running the Training

```bash
cd src/ml
pip install pandas scikit-learn numpy
python train.py
```

This outputs `model_weights.json` which the backend loads for predictions.

### 8.6 model_weights.json Format

```json
{
  "weights": {
    "income": -1.523,
    "expenses": 1.187,
    "total_savings": -2.045,
    "monthly_savings": -0.982,
    "membership_duration": -0.814,
    "loan_amount": 1.756,
    "guarantor_salary": -0.691,
    "collateral_value": -1.478,
    "dti": 2.534,
    "savings_ratio": -1.923
  },
  "bias": 0.482,
  "normalization": {
    "income": 60000,
    "expenses": 50000,
    "total_savings": 500000,
    "monthly_savings": 25000,
    "membership_duration": 60,
    "loan_amount": 1000000,
    "guarantor_salary": 50000,
    "collateral_value": 1500000,
    "dti": 1.0,
    "savings_ratio": 1.0
  },
  "feature_columns": ["income", "expenses", "total_savings", "monthly_savings", "membership_duration", "loan_amount", "guarantor_salary", "collateral_value", "dti", "savings_ratio"],
  "accuracy": 0.87,
  "model_version": "1.0",
  "risk_thresholds": {
    "low_max": 35,
    "medium_max": 65
  }
}
```

### 8.7 Backend AI Engine Implementation

In `ai-engine.service.ts`, load `model_weights.json` and predict:

```typescript
// Pseudocode for the AI engine service

class AIEngineService {
  private weights: Record<string, number>;
  private bias: number;
  private normalization: Record<string, number>;
  private thresholds: { low_max: number; medium_max: number };

  constructor() {
    // Load model_weights.json on startup
    const model = require('../ml/model_weights.json');
    this.weights = model.weights;
    this.bias = model.bias;
    this.normalization = model.normalization;
    this.thresholds = model.risk_thresholds;
  }

  predict(loanData) {
    // 1. Calculate derived features
    const dti = loanData.expenses / loanData.income;
    const savingsRatio = Math.min(loanData.totalSavings / loanData.amount, 1.0);
    const collateralCoverage = loanData.collateralValue / loanData.amount;

    // 2. Build feature map (use snake_case matching model)
    const features = {
      income: loanData.income,
      expenses: loanData.expenses,
      total_savings: loanData.totalSavings,
      monthly_savings: loanData.monthlySavings,
      membership_duration: loanData.membershipDuration,
      loan_amount: loanData.amount,
      guarantor_salary: loanData.guarantorSalary,
      collateral_value: loanData.collateralValue,
      dti: dti,
      savings_ratio: savingsRatio
    };

    // 3. Normalize
    const normalized = {};
    for (const key in features) {
      normalized[key] = features[key] / (this.normalization[key] || 1);
    }

    // 4. Logistic regression: z = bias + Σ(weight × normalized_feature)
    let z = this.bias;
    for (const key in this.weights) {
      z += this.weights[key] * (normalized[key] || 0);
    }

    // 5. Sigmoid → risk score
    const probability = 1 / (1 + Math.exp(-z));
    const riskScore = Math.round(probability * 100);

    // 6. Risk level & recommendation
    let riskLevel, recommendation;
    if (riskScore <= this.thresholds.low_max) {
      riskLevel = 'Low'; recommendation = 'Approve';
    } else if (riskScore <= this.thresholds.medium_max) {
      riskLevel = 'Medium'; recommendation = 'Modify';
    } else {
      riskLevel = 'High'; recommendation = 'Reject';
    }

    // 7. Generate explanations
    const explanation = this.generateExplanation(features, dti, savingsRatio, collateralCoverage);

    return { riskScore, riskLevel, explanation, recommendation, features };
  }

  generateExplanation(features, dti, savingsRatio, collateralCoverage) {
    const explanations = [];

    // DTI analysis
    if (dti > 0.6) {
      explanations.push(`High debt-to-income ratio (${Math.round(dti * 100)}%)`);
    } else {
      explanations.push(`Healthy debt-to-income ratio (${Math.round(dti * 100)}%)`);
    }

    // Savings ratio
    if (savingsRatio > 0.4) {
      explanations.push(`Strong savings-to-loan ratio (${Math.round(savingsRatio * 100)}%)`);
    } else {
      explanations.push(`Low savings-to-loan ratio (${Math.round(savingsRatio * 100)}%)`);
    }

    // Collateral
    if (collateralCoverage > 1) {
      explanations.push(`Collateral covers ${Math.round(collateralCoverage * 100)}% of loan value`);
    } else if (collateralCoverage > 0) {
      explanations.push(`Collateral covers only ${Math.round(collateralCoverage * 100)}% of loan`);
    } else {
      explanations.push('No collateral provided');
    }

    // Membership
    if (features.membership_duration > 24) {
      explanations.push(`Excellent membership history (${features.membership_duration} months)`);
    } else if (features.membership_duration > 12) {
      explanations.push(`Good membership history (${features.membership_duration} months)`);
    } else {
      explanations.push(`Short membership duration (${features.membership_duration} months)`);
    }

    // Guarantor
    if (features.guarantor_salary >= features.income * 0.5) {
      explanations.push(`Guarantor salary sufficient (${features.guarantor_salary.toLocaleString()} ETB)`);
    } else if (features.guarantor_salary > 0) {
      explanations.push(`Guarantor salary may be insufficient (${features.guarantor_salary.toLocaleString()} ETB)`);
    } else {
      explanations.push('No guarantor salary provided');
    }

    return explanations;
  }
}
```

### 8.8 Feature Mapping (Important!)

The dataset CSV uses **snake_case** for column names, but the frontend/API uses **camelCase**. The backend must map between them:

| API Field (camelCase) | Dataset Column (snake_case) | Model Weight Key |
|-----------------------|---------------------------|-----------------|
| `income` | `income` | `income` |
| `expenses` | `expenses` | `expenses` |
| `totalSavings` | `total_savings` | `total_savings` |
| `monthlySavings` | `monthly_savings` | `monthly_savings` |
| `membershipDuration` | `membership_duration` | `membership_duration` |
| `amount` | `loan_amount` | `loan_amount` |
| `guarantorSalary` | `guarantor_salary` | `guarantor_salary` |
| `collateralValue` | `collateral_value` | `collateral_value` |
| *(derived)* | `dti` | `dti` |
| *(derived)* | `savings_ratio` | `savings_ratio` |

The AI engine maps `loan.amount` → `loan_amount`, `loan.totalSavings` → `total_savings`, etc. when building the feature vector.

---

## 9. Reviews API

### POST `/api/reviews/officer`

**Roles:** `loan_officer`

> **IMPORTANT:** Officers do NOT have approval or rejection authority. Their role is to review the AI risk analysis and forward the application to the committee with their assessment.

**Request Body:**
```json
{
  "loanId": "663c...",
  "decision": "send_to_committee",
  "comment": "AI shows low risk (score 28). Strong savings ratio and collateral coverage. Recommending approval."
}
```

**Decision values:** `send_to_committee` (this is the ONLY valid value for officers)

**Business Logic:**
- `send_to_committee` → set loan status to `committee_review`
- Save decision to `decisions` collection with `reviewerType: 'officer'`
- Only allow if loan status is currently `officer_review`
- **Reject any other decision value** — officers cannot approve or reject

**Response (200):**
```json
{
  "success": true,
  "message": "Assessment forwarded to committee",
  "data": {
    "_id": "663e...",
    "loanId": "663c...",
    "reviewerType": "officer",
    "decision": "send_to_committee",
    "comment": "AI shows low risk (score 28). Strong savings ratio and collateral coverage. Recommending approval."
  }
}
```

---

### POST `/api/reviews/committee`

**Roles:** `committee`, `manager`

> **The committee is the ONLY authority that can approve or reject a loan.**

**Request Body:**
```json
{
  "loanId": "663c...",
  "decision": "approve",
  "comment": "Approved. Officer assessment confirms low risk. Client has strong repayment capacity."
}
```

**Decision values:** `approve`, `reject`, `request_modification`

**Business Logic:**
- `approve` → set loan status to `approved`
- `reject` → set loan status to `rejected`
- `request_modification` → set loan status to `modification_requested`
- Save decision to `decisions` collection with `reviewerType: 'committee'`
- Only allow if loan status is currently `committee_review`
- The committee sees both the AI analysis AND the officer's assessment/comment

---

### GET `/api/reviews/:loanId`

Get all review history for a loan.

**Implementation:** Find all decisions where `loanId` matches, populate `reviewerId` with `{ _id, name }`, sort by `createdAt` ascending.

**Response (200):**
```json
{
  "success": true,
  "message": "Reviews fetched",
  "data": [
    {
      "_id": "663e...",
      "loanId": "663c...",
      "reviewerType": "officer",
      "reviewerId": { "_id": "663a...", "name": "Abebe Kebede" },
      "decision": "send_to_committee",
      "comment": "Good application",
      "createdAt": "2024-05-11T10:00:00Z"
    },
    {
      "_id": "663f...",
      "loanId": "663c...",
      "reviewerType": "committee",
      "reviewerId": { "_id": "663g...", "name": "Kebede Tadesse" },
      "decision": "approve",
      "comment": "Approved after review",
      "createdAt": "2024-05-12T14:00:00Z"
    }
  ]
}
```

---

## 10. Reports API

### GET `/api/reports/dashboard`

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard stats",
  "data": {
    "totalLoans": 150,
    "pendingLoans": 12,
    "approvedLoans": 98,
    "rejectedLoans": 30,
    "highRiskLoans": 15,
    "totalClients": 85,
    "totalDisbursed": 5400000,
    "recentApplications": [
      {
        "_id": "663c...",
        "clientId": { "name": "Tigist Haile" },
        "amount": 100000,
        "status": "pending",
        "createdAt": "2024-05-10T00:00:00Z"
      }
    ]
  }
}
```

**Implementation:**
- `totalLoans`: count all loans
- `pendingLoans`: count where status = `pending`
- `approvedLoans`: count where status in [`approved`, `disbursed`, `closed`]
- `rejectedLoans`: count where status = `rejected`
- `highRiskLoans`: count predictions where riskLevel = `High`
- `totalClients`: count clients where status = `active`
- `totalDisbursed`: sum of `amount` for approved loans
- `recentApplications`: latest 5 loans, sorted by `createdAt` desc, populate client name

---

### GET `/api/reports/risk-distribution`

**Response (200):**
```json
{
  "success": true,
  "message": "Risk distribution",
  "data": {
    "distribution": {
      "Low": 65,
      "Medium": 45,
      "High": 15
    },
    "averageRiskScore": 38,
    "approvalRate": 78.4,
    "monthlyTrend": [
      { "month": "2024-01", "total": 12, "approved": 9, "rejected": 3 },
      { "month": "2024-02", "total": 15, "approved": 12, "rejected": 3 },
      { "month": "2024-03", "total": 18, "approved": 14, "rejected": 4 }
    ]
  }
}
```

**Implementation:**
- `distribution`: group predictions by `riskLevel`, count each
- `averageRiskScore`: average of all `riskScore` values
- `approvalRate`: `(approved loans / total loans) × 100`
- `monthlyTrend`: aggregate loans by month (from `createdAt`), count total, approved, rejected per month

---

## 11. Users API (Admin)

### GET `/api/users`

**Roles:** `admin`

**Query Params:** `?page=1&limit=10&role=loan_officer&search=abebe`

**Response (200):**
```json
{
  "success": true,
  "message": "Users fetched",
  "data": {
    "items": [
      {
        "_id": "663a...",
        "name": "Abebe Kebede",
        "email": "officer@sacco.com",
        "role": "loan_officer",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### PATCH `/api/users/:id`

**Roles:** `admin`

```json
{ "role": "committee", "isActive": false }
```

### DELETE `/api/users/:id`

**Roles:** `admin`

---

## 12. Status Flow & Business Rules

### Status State Machine

```
pending ──── (AI prediction runs) ──── officer_review
                                            │
                                     (officer ALWAYS forwards)
                                            │
                                            ▼
                                      committee_review
                                            │
                               ┌────────────┼────────────┐
                               ▼            ▼            ▼
                           approved     rejected    modification_requested
                                                        │
                                                        ▼
                                                     pending (resubmit)
```

### Key Principle: Human Decision Authority

> **Officers DO NOT have approval/rejection power.** They review the AI analysis and forward their assessment to the committee. Only the **committee** can approve, reject, or request modification.

### Business Rules

1. **Client validation:** Loan cannot be created if client status is `inactive`
2. **Prediction required:** AI prediction must run before officer review. Running prediction changes status from `pending` → `officer_review`
3. **Officer role:** Officers review AI results and forward to committee. They can ONLY `send_to_committee`. They cannot approve or reject.
4. **Committee authority:** ONLY the committee (or manager) can approve, reject, or request modification. Committee is 2+ people who discuss before deciding.
5. **Committee scope:** Committee can only act on loans in `committee_review` status
6. **No skipping committee:** EVERY loan must go through the committee. No auto-approval, no officer shortcuts.
7. **Modification cycle:** When committee requests modification:
   - Loan status → `modification_requested`
   - Officer edits the loan terms (via `PATCH /api/loans/:id`)
   - Editing resets status back to `pending`
   - Officer re-runs AI analysis → status becomes `officer_review`
   - Officer reviews new AI results and forwards to committee again
   - Full cycle repeats until committee approves or rejects
8. **Loan edit restriction:** Loans can ONLY be edited when status is `pending` or `modification_requested`
9. **Admin only:** Only admins can create/manage users
10. **Positive amounts:** Loan amounts must be positive numbers
11. **Multiple predictions:** Multiple predictions can exist for one loan (if re-analyzed). Always use the latest.
12. **Audit trail:** Every decision (officer assessment + committee decision) is saved to `decisions` collection — never delete decisions. This builds a complete history of the review cycle.
13. **Committee sees everything:** When committee reviews, they see: client info, business plan, AI prediction + explanation, AND the officer's assessment notes

---

## 13. Seed Data

Create a seed script that populates test data for development and demo.

### Default Users

| Name | Email | Role | Password |
|------|-------|------|----------|
| Admin User | admin@sacco.com | admin | admin123 |
| Abebe Kebede | officer@sacco.com | loan_officer | officer123 |
| Fatima Ali | officer2@sacco.com | loan_officer | officer123 |
| Kebede Tadesse | committee@sacco.com | committee | committee123 |
| Sara Mohammed | manager@sacco.com | manager | manager123 |

### Sample Clients

Generate 8–10 clients with Ethiopian names, realistic savings balances, and various business types.

### Sample Loans

Generate 5–7 loans in various statuses (pending, officer_review, committee_review, approved, rejected) with corresponding predictions and decisions.

---

## 14. Build Phases

### Phase 1 (Week 1) — Foundation
- [ ] Project setup (NestJS + MongoDB + Mongoose)
- [ ] Auth module: `POST /auth/login`, `POST /auth/register`, `GET /auth/me`
- [ ] JWT guard + Role guard middleware
- [ ] Seed script with default users
- [ ] Clients CRUD: all 4 endpoints

### Phase 2 (Week 2) — Loans
- [ ] Loans CRUD: all 4 endpoints
- [ ] Loan status workflow validation
- [ ] Populate client/user refs in responses
- [ ] Seed sample clients and loans

### Phase 3 (Week 3) — AI & Reviews
- [ ] Create sample dataset CSV (200+ rows)
- [ ] Train model with Python script
- [ ] AI Engine service (load weights, predict)
- [ ] `POST /predictions/predict-risk`
- [ ] `GET /predictions/:loanId`
- [ ] Officer review: `POST /reviews/officer`
- [ ] Committee review: `POST /reviews/committee`
- [ ] Review history: `GET /reviews/:loanId`

### Phase 4 (Week 4) — Reports & Polish
- [ ] `GET /reports/dashboard`
- [ ] `GET /reports/risk-distribution`
- [ ] Users CRUD for admin
- [ ] Error handling polish
- [ ] Seed complete demo data
- [ ] Integration testing with frontend

---

> **CRITICAL REMINDER:** Both frontend and backend MUST use the exact same field names (camelCase) and response formats documented here. The frontend is already built with mock data following this exact contract. When the backend is ready, the frontend just switches from mock API to real API calls — zero UI changes needed.

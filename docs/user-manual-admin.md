# User Manual — Administrator — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Introduction

This manual covers platform administration for the Global FinTech (AtlasX) platform, including user management, compliance monitoring, system configuration, and operational oversight.

## 2. Admin Dashboard Access

1. Navigate to the admin portal URL
2. Authenticate via Keycloak SSO with admin credentials
3. Complete MFA challenge (TOTP or hardware key)

## 3. User Management

### 3.1 View Users
- Navigate to Users → User Directory
- Filter by status (active, suspended, frozen, closed)
- Search by email, phone, or user ID

### 3.2 KYC Review Queue
- Access Compliance → KYC Queue
- Review pending verification documents
- Approve, reject, or request additional documents

### 3.3 Account Actions
- Freeze/unfreeze accounts
- Adjust KYC tier levels
- Reset MFA credentials
- View user transaction history

## 4. Transaction Monitoring

### 4.1 Real-Time Dashboard
- View live transaction feed with volume/value metrics
- Monitor payment gateway health and success rates
- Track cross-border payment status

### 4.2 Alert Management
- Review RegAI-triggered alerts
- Assign cases to compliance analysts
- Track investigation progress and SAR submissions

## 5. System Configuration

### 5.1 Feature Flags
- Enable/disable modules (Investments, ROSCA, P2P Lending)
- Toggle payment providers per region
- Configure rate limits per tier

### 5.2 FX Rate Management
- View current interbank rates
- Configure FX markup per currency pair
- Set rate refresh intervals

## 6. Reporting

- Generate regulatory reports per jurisdiction
- Export transaction volumes and revenue analytics
- Download compliance audit trails

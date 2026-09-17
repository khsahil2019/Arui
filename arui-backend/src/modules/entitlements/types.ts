export type EntitlementStatus =
  | 'NOT_PURCHASED'
  | 'PAYMENT_PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'EXPIRED';

export interface EngineEntitlement {
  id: string;
  institutionId: string;
  productCode: string;
  productName: string;
  status: EntitlementStatus;
  cycle: string;
  paymentId?: string;
  activatedAt?: string;
  expiresAt?: string;
  assessmentId?: string;
  assessmentStatus?: string;
  pricingAmount?: number;
  currency?: string;
}

export interface PaymentTransaction {
  id: string;
  institutionId: string;
  userId?: string;
  productCode: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionReference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  invoiceNumber?: string;
  createdAt: string;
}

export interface PortfolioSummary {
  institutionId: string;
  institutionName: string;
  entitlements: EngineEntitlement[];
  totalActiveEngagements: number;
  totalAvailableEngagements: number;
}

export interface PurchaseEngagementInput {
  productCode: string;
  paymentMethod?: string;
  currency?: string;
  amount?: number;
  notes?: string;
  billingContact?: {
    name: string;
    email: string;
    phone?: string;
    designation?: string;
  };
}

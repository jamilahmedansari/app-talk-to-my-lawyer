// Database types for Talk-To-My-Lawyer

export type UserRole = 'user' | 'employee' | 'admin';

export type SubscriptionStatus = 'active' | 'canceled' | 'expired';

export type LetterStatus = 'generating' | 'completed' | 'failed';

export type CommissionStatus = 'pending' | 'paid' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  subscription_tier: string | null;
  subscription_status: SubscriptionStatus | null;
  subscription_expires_at: string | null;
  referrals: number;
  earnings: number;
  created_at: string;
  updated_at: string;
}

export interface UserRole_Table {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Letter {
  id: string;
  user_id: string;
  title: string;
  content: string;
  recipient_name: string | null;
  recipient_address: string | null;
  status: LetterStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: SubscriptionStatus;
  price: number | null;
  discount: number | null;
  coupon_code: string | null;
  employee_id: string | null;
  expires_at: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCoupon {
  id: string;
  employee_id: string;
  code: string;
  discount_percent: number;
  usage_count: number;
  max_usage: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  employee_id: string;
  subscription_id: string | null;
  commission_amount: number;
  status: CommissionStatus;
  created_at: string;
  paid_at: string | null;
}

// Plan details
export const SUBSCRIPTION_PLANS = {
  single: { name: 'Single Letter', price: 29.99, letters: 1 },
  annual4: { name: '4 Letters/Year', price: 99.99, letters: 4 },
  annual8: { name: '8 Letters/Year', price: 179.99, letters: 8 },
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

// Type guard functions
export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

export function isEmployee(role: UserRole): boolean {
  return role === 'employee';
}

export function isUser(role: UserRole): boolean {
  return role === 'user';
}

export function hasEmployeeAccess(role: UserRole): boolean {
  return role === 'employee' || role === 'admin';
}

export function hasAdminAccess(role: UserRole): boolean {
  return role === 'admin';
}

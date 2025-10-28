// Database types for Talk-To-My-Lawyer

export type UserRole = 'subscriber' | 'employee' | 'admin';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export type LetterStatus = 'draft' | 'completed' | 'archived';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Letter {
  id: string;
  user_id: string;
  title: string;
  content: string;
  recipient_name: string | null;
  recipient_address: string | null;
  status: LetterStatus;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: SubscriptionStatus;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

export interface AffiliateTransaction {
  id: string;
  affiliate_user_id: string;
  referred_user_id: string;
  commission_amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

// Type guard functions
export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

export function isEmployee(role: UserRole): boolean {
  return role === 'employee';
}

export function isSubscriber(role: UserRole): boolean {
  return role === 'subscriber';
}

export function hasEmployeeAccess(role: UserRole): boolean {
  return role === 'employee' || role === 'admin';
}

export function hasAdminAccess(role: UserRole): boolean {
  return role === 'admin';
}

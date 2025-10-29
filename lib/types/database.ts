// Database types for Talk-To-My-Lawyer

export type UserRole = 'user' | 'employee' | 'admin';

export type SubscriptionStatus = 'active' | 'canceled' | 'expired';

export type LetterStatus = 'generating' | 'completed' | 'failed';

export type CommissionStatus = 'pending' | 'paid' | 'cancelled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      user_roles: {
        Row: UserRole_Table
        Insert: Omit<UserRole_Table, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserRole_Table, 'user_id' | 'created_at'>>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subscription, 'id' | 'created_at'>>
      }
      commissions: {
        Row: Commission
        Insert: Omit<Commission, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Commission, 'id' | 'created_at'>>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  referrals: number
  earnings: number | string
  created_at: string
  updated_at: string
}

export interface UserRole_Table {
  user_id: string
  role: 'admin' | 'employee' | 'user'
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: string
  status: 'active' | 'inactive' | 'cancelled'
  price: number | string
  discount: number | null
  coupon_code: string | null
  created_at: string
  updated_at: string
}

export interface Commission {
  id: string
  employee_id: string
  commission_amount: number | string
  status: 'pending' | 'paid' | 'cancelled'
  paid_at: string | null
  created_at: string
  updated_at: string
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

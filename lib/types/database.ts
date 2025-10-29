// Database types for Talk-To-My-Lawyer

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type UserRole = "user" | "employee" | "admin";

export type SubscriptionStatus = "active" | "canceled" | "expired";

export type LetterStatus = "draft" | "generating" | "completed" | "failed";

export type CommissionStatus = "pending" | "paid" | "cancelled";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  earnings: number | string | null;
  referrals: number;
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: SubscriptionStatus;
  price: number | string | null;
  discount: number | null;
  coupon_code: string | null;
  employee_id: string | null;
  expires_at: string | null;
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
  completed_at: string | null;
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
  subscription_id: string;
  commission_amount: number | string;
  status: CommissionStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          earnings?: number | string | null;
          referrals?: number;
          subscription_tier?: string | null;
          subscription_status?: string | null;
          subscription_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id">>;
        Relationships: [];
      };
      user_roles: {
        Row: UserRoleRow;
        Insert: {
          id?: string;
          user_id: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserRoleRow, "id" | "user_id">>;
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: Subscription;
        Insert: {
          id?: string;
          user_id: string;
          plan: string;
          status?: SubscriptionStatus;
          price?: number | string | null;
          discount?: number | null;
          coupon_code?: string | null;
          employee_id?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Subscription, "id" | "user_id">>;
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_employee_id_fkey";
            columns: ["employee_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      commissions: {
        Row: Commission;
        Insert: {
          id?: string;
          employee_id: string;
          subscription_id: string;
          commission_amount: number | string;
          status?: CommissionStatus;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Commission, "id" | "employee_id" | "subscription_id">>;
        Relationships: [
          {
            foreignKeyName: "commissions_employee_id_fkey";
            columns: ["employee_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commissions_subscription_id_fkey";
            columns: ["subscription_id"];
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          }
        ];
      };
      letters: {
        Row: Letter;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          recipient_name?: string | null;
          recipient_address?: string | null;
          status?: LetterStatus;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Letter, "id" | "user_id">>;
        Relationships: [
          {
            foreignKeyName: "letters_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      employee_coupons: {
        Row: EmployeeCoupon;
        Insert: {
          id?: string;
          employee_id: string;
          code: string;
          discount_percent: number;
          usage_count?: number;
          max_usage?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<EmployeeCoupon, "id" | "employee_id" | "code">>;
        Relationships: [
          {
            foreignKeyName: "employee_coupons_employee_id_fkey";
            columns: ["employee_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_logs: {
        Row: AuditLog;
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<AuditLog, "id">>;
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {
      check_subscription_limits: {
        Args: { p_user: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      letter_status: LetterStatus;
      commission_status: CommissionStatus;
      sub_status: SubscriptionStatus;
    };
    CompositeTypes: {};
  };
};

export const SUBSCRIPTION_PLANS = {
  single: { name: "Single Letter", price: 29.99, letters: 1 },
  annual4: { name: "4 Letters/Year", price: 99.99, letters: 4 },
  annual8: { name: "8 Letters/Year", price: 179.99, letters: 8 },
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

// Type guard functions
export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}

export function isEmployee(role: UserRole): boolean {
  return role === "employee";
}

export function isUser(role: UserRole): boolean {
  return role === "user";
}

export function hasEmployeeAccess(role: UserRole): boolean {
  return role === "employee" || role === "admin";
}

export function hasAdminAccess(role: UserRole): boolean {
  return role === "admin";
}

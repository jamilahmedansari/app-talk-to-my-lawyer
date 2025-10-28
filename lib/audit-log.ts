/**
 * Audit Logging Utility
 * Provides functions to log security events and admin actions
 */

import { createClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "./env-validation";

// Audit event types matching the database enum
export type AuditEventType =
  | "user_created"
  | "user_updated"
  | "user_deleted"
  | "user_role_changed"
  | "letter_created"
  | "letter_updated"
  | "letter_deleted"
  | "subscription_created"
  | "subscription_updated"
  | "subscription_canceled"
  | "coupon_created"
  | "coupon_updated"
  | "coupon_deleted"
  | "admin_login"
  | "admin_secret_verified"
  | "rate_limit_exceeded"
  | "invalid_input"
  | "security_event";

export interface AuditLogEntry {
  userId?: string;
  eventType: AuditEventType;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Get Supabase admin client for audit logging
 * This uses service role key to bypass RLS
 */
function getAuditClient() {
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Log an audit event
 * @param entry - The audit log entry to create
 * @returns The created audit log ID or null if failed
 */
export async function logAuditEvent(
  entry: AuditLogEntry
): Promise<string | null> {
  try {
    const supabase = getAuditClient();

    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        user_id: entry.userId || null,
        event_type: entry.eventType,
        action: entry.action,
        resource_type: entry.resourceType || null,
        resource_id: entry.resourceId || null,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
        metadata: entry.metadata || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to log audit event:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Exception while logging audit event:", error);
    return null;
  }
}

/**
 * Extract client information from a Next.js request
 * @param request - The incoming request
 * @returns Object with IP address and user agent
 */
export function getClientInfo(request: Request): {
  ipAddress: string;
  userAgent: string;
} {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const ipAddress =
    cfConnectingIp || realIp || forwarded?.split(",")[0] || "unknown";

  const userAgent = request.headers.get("user-agent") || "unknown";

  return {
    ipAddress: ipAddress.trim(),
    userAgent,
  };
}

/**
 * Helper function to log security events
 */
export async function logSecurityEvent(
  action: string,
  request: Request,
  metadata?: Record<string, unknown>
): Promise<string | null> {
  const { ipAddress, userAgent } = getClientInfo(request);

  return logAuditEvent({
    eventType: "security_event",
    action,
    ipAddress,
    userAgent,
    metadata,
  });
}

/**
 * Helper function to log admin actions
 */
export async function logAdminAction(
  userId: string,
  action: string,
  request: Request,
  resourceType?: string,
  resourceId?: string,
  metadata?: Record<string, unknown>
): Promise<string | null> {
  const { ipAddress, userAgent } = getClientInfo(request);

  return logAuditEvent({
    userId,
    eventType: "security_event",
    action,
    resourceType,
    resourceId,
    ipAddress,
    userAgent,
    metadata,
  });
}

/**
 * Helper function to log rate limit violations
 */
export async function logRateLimitExceeded(
  request: Request,
  endpoint: string,
  userId?: string
): Promise<string | null> {
  const { ipAddress, userAgent } = getClientInfo(request);

  return logAuditEvent({
    userId,
    eventType: "rate_limit_exceeded",
    action: `Rate limit exceeded for endpoint: ${endpoint}`,
    ipAddress,
    userAgent,
    metadata: { endpoint },
  });
}

/**
 * Helper function to log invalid input attempts
 */
export async function logInvalidInput(
  request: Request,
  field: string,
  reason: string,
  userId?: string
): Promise<string | null> {
  const { ipAddress, userAgent } = getClientInfo(request);

  return logAuditEvent({
    userId,
    eventType: "invalid_input",
    action: `Invalid input for field: ${field}`,
    ipAddress,
    userAgent,
    metadata: { field, reason },
  });
}

/**
 * Query audit logs with filters
 * Only works with admin/service role credentials
 */
export async function queryAuditLogs(filters: {
  userId?: string;
  eventType?: AuditEventType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  try {
    const supabase = getAuditClient();
    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }

    if (filters.eventType) {
      query = query.eq("event_type", filters.eventType);
    }

    if (filters.startDate) {
      query = query.gte("created_at", filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte("created_at", filters.endDate.toISOString());
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(100); // Default limit
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to query audit logs:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Exception while querying audit logs:", error);
    return null;
  }
}

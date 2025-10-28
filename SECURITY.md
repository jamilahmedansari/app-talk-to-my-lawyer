# Security Implementation Guide

## Overview

This document describes the security measures implemented in Talk-To-My-Lawyer application.

## Critical Security Fixes (Implemented)

### 1. Rate Limiting

**Location**: `lib/rate-limit.ts`

The application now includes an in-memory rate limiter to prevent brute force attacks.

**Features**:
- Configurable request limits and time windows
- Automatic cleanup of expired entries
- Client identification via IP address (supports proxy headers)

**Usage Example**:
```typescript
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

const identifier = getClientIdentifier(request);
const result = rateLimit(`endpoint-name:${identifier}`, {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

if (!result.success) {
  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429 }
  );
}
```

**Current Implementation**:
- Admin secret verification: 5 attempts per 15 minutes per IP

**Production Considerations**:
For production deployment at scale, consider replacing the in-memory store with:
- Redis
- Upstash Rate Limit
- Cloudflare Rate Limiting

### 2. Constant-Time String Comparison

**Location**: `lib/rate-limit.ts`

All secret comparisons now use constant-time comparison to prevent timing attacks.

**Function**: `constantTimeEqual(a: string, b: string)`

This prevents attackers from determining the correct secret by measuring response times.

### 3. Input Validation

All API endpoints now validate input data:

**Admin Secret Verification** (`app/api/admin/verify-secret/route.ts`):
- Max length: 100 characters
- Type validation: string only
- Rate limited: 5 attempts per 15 minutes

**Coupon Validation** (`app/api/validate-coupon/route.ts`):
- Max length: 50 characters
- Format validation: alphanumeric, hyphens, and underscores only
- Pattern: `^[A-Za-z0-9_-]+$`

### 4. Environment Variable Validation

**Location**: `lib/env-validation.ts`

The application validates all required environment variables at startup.

**Required Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SIGNUP_SECRET`

**Optional Variables** (feature-dependent):
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `ANTHROPIC_API_KEY`

**Functions**:
- `validateEnv(throwOnError)`: Validates all environment variables
- `getRequiredEnv(name)`: Gets a required env var or throws error
- `getOptionalEnv(name, default)`: Gets an optional env var with default

**Usage**:
```typescript
import { getRequiredEnv } from "@/lib/env-validation";

const apiKey = getRequiredEnv("SOME_API_KEY");
```

All Supabase clients now use `getRequiredEnv()` instead of non-null assertions (`!`).

## Security Best Practices

### API Route Security Checklist

When creating a new API route, ensure you:

1. Add input validation for all parameters
2. Implement rate limiting for sensitive endpoints
3. Use constant-time comparison for secrets
4. Validate environment variables
5. Return appropriate HTTP status codes
6. Avoid exposing internal error details
7. Log security-relevant events

### Protected Routes

The middleware enforces authentication and role-based access control:

**Protected Paths**:
- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires admin role

**Role Hierarchy**:
- `admin`: Full access to all routes
- `employee`: Access to employee dashboard
- `subscriber`: Access to subscriber dashboard

## Known Limitations

1. **In-Memory Rate Limiting**: Current implementation uses in-memory storage which:
   - Resets on server restart
   - Doesn't work across multiple instances
   - Not suitable for horizontal scaling

2. **Missing Audit Logging**: Admin actions are not currently logged

3. **No CAPTCHA**: Rate limiting alone may not prevent sophisticated attacks

## Recommendations for Production

### High Priority

1. **Replace In-Memory Rate Limiting**: Use Redis or Upstash
2. **Implement Audit Logging**: Track all admin actions and sensitive operations
3. **Add CAPTCHA**: Protect authentication and admin endpoints
4. **Enable CORS**: Configure appropriate CORS policies
5. **Add Request ID**: Include request IDs for debugging and security analysis

### Medium Priority

1. **Implement CSP Headers**: Add Content Security Policy headers
2. **Enable HSTS**: Use HTTP Strict Transport Security
3. **Add Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
4. **Set up Error Tracking**: Use Sentry or similar service
5. **Implement IP Allowlisting**: For admin endpoints if applicable

### Low Priority

1. **Add Request Signing**: For API requests from trusted clients
2. **Implement API Keys**: For programmatic access
3. **Add Webhooks**: For security events
4. **Enable 2FA**: For admin accounts

## Testing Security Features

### Test Rate Limiting

```bash
# Test admin secret endpoint
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/admin/verify-secret \
    -H "Content-Type: application/json" \
    -d '{"secretKey":"wrong-secret"}'
  echo "Attempt $i"
done
```

After 5 attempts, you should receive a 429 status code.

### Test Input Validation

```bash
# Test coupon validation with invalid characters
curl "http://localhost:3000/api/validate-coupon?code=INVALID<>CHARS"

# Test with too long string
curl "http://localhost:3000/api/validate-coupon?code=$(python3 -c 'print("A"*51)')"
```

### Test Environment Variable Validation

```bash
# Start the app without required env vars
unset NEXT_PUBLIC_SUPABASE_URL
npm run dev
```

The app should fail to start with a clear error message.

## Incident Response

If you detect suspicious activity:

1. Check server logs for the attacker's IP address
2. Review rate limit violations
3. Check database for unauthorized access
4. Rotate secrets if compromised
5. Block malicious IPs at firewall/proxy level
6. Review and update security measures

## Security Contacts

For security issues, please report to:
- Create a private security advisory on GitHub
- Or contact the development team directly

## Changelog

### 2025-10-28
- Added rate limiting middleware
- Implemented constant-time string comparison
- Added input validation to all API endpoints
- Implemented environment variable validation
- Updated Supabase clients to use safe env variable access
- Created security documentation

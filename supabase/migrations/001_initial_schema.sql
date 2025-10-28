-- Talk-To-My-Lawyer - Initial Schema Migration
-- Phase 10: Database structure placeholders

-- TODO: Implement Users table
-- Fields: id, email, full_name, role, created_at, updated_at

-- TODO: Implement Letters table
-- Fields: id, user_id, title, content, status, created_at, updated_at

-- TODO: Implement Subscriptions table
-- Fields: id, user_id, plan, status, stripe_subscription_id, current_period_end, created_at, updated_at

-- TODO: Implement Coupons table
-- Fields: id, code, discount_percent, max_uses, used_count, expires_at, created_at

-- TODO: Implement Affiliate Transactions table
-- Fields: id, affiliate_user_id, referred_user_id, commission_amount, status, created_at

-- TODO: Add RLS policies for all tables
-- TODO: Add indexes for performance
-- TODO: Add triggers for updated_at timestamps

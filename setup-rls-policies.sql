-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Contractors policies
CREATE POLICY "Contractors can view own data" ON contractors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Contractors can update own data" ON contractors FOR UPDATE USING (auth.uid() = user_id);

-- Admins policies (admins can see all)
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can view all contractors" ON contractors FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Letters policies
CREATE POLICY "Users can view own letters" ON letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create letters" ON letters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own letters" ON letters FOR UPDATE USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);

-- Coupons policies
CREATE POLICY "Contractors can view own coupons" ON coupons FOR SELECT USING (
  contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid())
);
CREATE POLICY "Contractors can create coupons" ON coupons FOR INSERT WITH CHECK (
  contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid())
);

-- Payment sessions policies
CREATE POLICY "Users can view own payment sessions" ON payment_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payment sessions" ON payment_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Webhook logs policies (admin only)
CREATE POLICY "Admins can view webhook logs" ON webhook_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Email logs policies (admin only)
CREATE POLICY "Admins can view email logs" ON email_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Allow service role to bypass RLS for server operations
CREATE POLICY "Service role bypass" ON users FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY "Service role bypass contractors" ON contractors FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY "Service role bypass admins" ON admins FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY "Service role bypass letters" ON letters FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY "Service role bypass documents" ON documents FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY "Service role bypass coupons" ON coupons FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY "Service role bypass payment_sessions" ON payment_sessions FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY "Service role bypass webhook_logs" ON webhook_logs FOR ALL USING (current_setting('role') = 'service_role');
CREATE POLICY "Service role bypass email_logs" ON email_logs FOR ALL USING (current_setting('role') = 'service_role');
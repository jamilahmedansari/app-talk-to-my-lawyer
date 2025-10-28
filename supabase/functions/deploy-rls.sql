-- ====================================
-- DEPLOY RLS POLICIES SQL
-- Run this in Supabase SQL Editor
-- ====================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ====================================
-- PROFILES POLICIES
-- ====================================

DROP POLICY IF EXISTS p_profiles_self_read ON public.profiles;
CREATE POLICY p_profiles_self_read ON public.profiles
FOR SELECT USING (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS p_profiles_self_update ON public.profiles;
CREATE POLICY p_profiles_self_update ON public.profiles
FOR UPDATE USING (id = auth.uid() OR is_admin())
WITH CHECK (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS p_profiles_admin_insert ON public.profiles;
CREATE POLICY p_profiles_admin_insert ON public.profiles
FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS p_profiles_admin_delete ON public.profiles;
CREATE POLICY p_profiles_admin_delete ON public.profiles
FOR DELETE USING (is_admin());

-- ====================================
-- LETTERS POLICIES
-- ====================================

DROP POLICY IF EXISTS p_letters_owner_all ON public.letters;
CREATE POLICY p_letters_owner_all ON public.letters
FOR ALL USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- ====================================
-- SUBSCRIPTIONS POLICIES
-- ====================================

DROP POLICY IF EXISTS p_subs_owner_all ON public.subscriptions;
CREATE POLICY p_subs_owner_all ON public.subscriptions
FOR ALL USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- ====================================
-- EMPLOYEE_COUPONS POLICIES
-- ====================================

DROP POLICY IF EXISTS p_coupons_public_read ON public.employee_coupons;
CREATE POLICY p_coupons_public_read ON public.employee_coupons
FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS p_coupons_owner_select ON public.employee_coupons;
CREATE POLICY p_coupons_owner_select ON public.employee_coupons
FOR SELECT USING (employee_id = auth.uid() OR is_employee() OR is_admin());

DROP POLICY IF EXISTS p_coupons_admin_insert ON public.employee_coupons;
CREATE POLICY p_coupons_admin_insert ON public.employee_coupons
FOR INSERT WITH CHECK (is_employee() OR is_admin());

DROP POLICY IF EXISTS p_coupons_admin_update ON public.employee_coupons;
CREATE POLICY p_coupons_admin_update ON public.employee_coupons
FOR UPDATE USING (employee_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS p_coupons_admin_delete ON public.employee_coupons;
CREATE POLICY p_coupons_admin_delete ON public.employee_coupons
FOR DELETE USING (is_admin());

-- ====================================
-- COMMISSIONS POLICIES
-- ====================================

DROP POLICY IF EXISTS p_comm_emp_select ON public.commissions;
CREATE POLICY p_comm_emp_select ON public.commissions
FOR SELECT USING (employee_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS p_comm_admin_write ON public.commissions;
CREATE POLICY p_comm_admin_write ON public.commissions
FOR ALL USING (is_admin())
WITH CHECK (is_admin());

-- ====================================
-- USER_ROLES POLICIES
-- ====================================

DROP POLICY IF EXISTS p_roles_self_read ON public.user_roles;
CREATE POLICY p_roles_self_read ON public.user_roles
FOR SELECT USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS p_roles_admin_write ON public.user_roles;
CREATE POLICY p_roles_admin_write ON public.user_roles
FOR ALL USING (is_admin())
WITH CHECK (is_admin());

-- ====================================
-- GRANT TABLE PERMISSIONS
-- ====================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Allow anon to read active coupons for public validation
GRANT SELECT ON public.employee_coupons TO anon;

-- ====================================
-- DEPLOYMENT COMPLETE
-- ====================================

SELECT 'RLS Policies deployed successfully!' AS status;

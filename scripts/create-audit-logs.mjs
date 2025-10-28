/**
 * Create audit_logs table compatible with new schema
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local manually
const envPath = resolve(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' }
})

console.log('🚀 Creating audit_logs table...\n')

// Since we can't execute raw SQL easily, let's just verify if audit_logs exists
// and provide instructions if not

async function checkAndCreate() {
  const { error } = await supabase.from('audit_logs').select('id').limit(1)

  if (error) {
    console.log('❌ audit_logs table does not exist\n')
    console.log('📋 Please run this SQL in Supabase Dashboard:\n')
    console.log('   Dashboard URL: https://supabase.com/dashboard/project/liepvjfiezgjrchbdwnb/sql/new\n')
    console.log('='  .repeat(80))
    console.log(getSQLToRun())
    console.log('='.repeat(80))
  } else {
    console.log('✅ audit_logs table already exists!')
  }
}

function getSQLToRun() {
  return `-- Create audit_event_type enum
DO $$ BEGIN
  CREATE TYPE audit_event_type AS ENUM (
    'user_created', 'user_updated', 'user_deleted', 'user_role_changed',
    'letter_created', 'letter_updated', 'letter_deleted',
    'subscription_created', 'subscription_updated', 'subscription_canceled',
    'coupon_created', 'coupon_updated', 'coupon_deleted',
    'admin_login', 'admin_secret_verified', 'rate_limit_exceeded',
    'invalid_input', 'security_event'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type audit_event_type NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (using user_roles table)
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role::text = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Audit logging function
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_event_type audit_event_type,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, event_type, action, resource_type, resource_id,
    ip_address, user_agent, metadata
  ) VALUES (
    p_user_id, p_event_type, p_action, p_resource_type, p_resource_id,
    p_ip_address, p_user_agent, p_metadata
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO service_role;

COMMENT ON TABLE public.audit_logs IS 'System audit logs for tracking admin actions and security events';`
}

checkAndCreate().catch(console.error)

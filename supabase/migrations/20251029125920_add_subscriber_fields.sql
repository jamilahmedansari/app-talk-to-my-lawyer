-- Add new fields to subscriptions table for subscriber management
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS tier TEXT,
ADD COLUMN IF NOT EXISTS letters_remaining INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_allocation INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_refill_date TIMESTAMPTZ;

-- Add new fields to letters table
ALTER TABLE public.letters
ADD COLUMN IF NOT EXISTS attorney_email TEXT,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- Create purchases table for tracking mock checkouts
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  tier TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create refill_history table for tracking letter refills
CREATE TABLE IF NOT EXISTS public.refill_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  letters_refilled INTEGER NOT NULL,
  refilled_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_subscription_id ON public.purchases(subscription_id);
CREATE INDEX IF NOT EXISTS idx_refill_history_subscription_id ON public.refill_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_refill_date ON public.subscriptions(next_refill_date);
CREATE INDEX IF NOT EXISTS idx_letters_attorney_email ON public.letters(attorney_email);

-- Enable RLS on new tables
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refill_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for purchases
CREATE POLICY p_purchases_select_own ON public.purchases
  FOR SELECT USING (auth.uid() = user_id OR is_admin() OR is_employee());

CREATE POLICY p_purchases_insert ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for refill_history
CREATE POLICY p_refill_history_select ON public.refill_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE id = refill_history.subscription_id
      AND (user_id = auth.uid() OR is_admin() OR is_employee())
    )
  );

COMMENT ON TABLE public.purchases IS 'Tracks all subscription purchases including mock checkouts';
COMMENT ON TABLE public.refill_history IS 'Tracks monthly letter allocation refills for subscriptions';

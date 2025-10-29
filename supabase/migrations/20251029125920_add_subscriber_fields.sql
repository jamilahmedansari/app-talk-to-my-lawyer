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

-- Function to check if user needs letter refill (for scheduled job)
CREATE OR REPLACE FUNCTION public.process_subscription_refills()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  refill_count INTEGER := 0;
  sub_record RECORD;
BEGIN
  -- Find subscriptions that need refilling
  FOR sub_record IN
    SELECT id, user_id, tier, monthly_allocation, next_refill_date
    FROM public.subscriptions
    WHERE status = 'active'
    AND tier IN ('annual-basic', 'annual-premium')
    AND next_refill_date <= NOW()
  LOOP
    -- Refill the letters
    UPDATE public.subscriptions
    SET letters_remaining = monthly_allocation,
        next_refill_date = next_refill_date + INTERVAL '1 month'
    WHERE id = sub_record.id;
    
    -- Log the refill
    INSERT INTO public.refill_history (subscription_id, letters_refilled)
    VALUES (sub_record.id, sub_record.monthly_allocation);
    
    refill_count := refill_count + 1;
  END LOOP;
  
  RETURN refill_count;
END;
$$;

COMMENT ON FUNCTION public.process_subscription_refills IS 'Processes monthly letter refills for active annual subscriptions';

-- Function to decrement letters_remaining when a letter is generated
CREATE OR REPLACE FUNCTION public.decrement_letter_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only decrement when letter status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.subscriptions
    SET letters_remaining = GREATEST(letters_remaining - 1, 0)
    WHERE id = (
      SELECT id FROM public.subscriptions
      WHERE user_id = NEW.user_id
      AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic quota decrement
DROP TRIGGER IF EXISTS trigger_decrement_letter_quota ON public.letters;
CREATE TRIGGER trigger_decrement_letter_quota
  AFTER INSERT OR UPDATE ON public.letters
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_letter_quota();

COMMENT ON FUNCTION public.decrement_letter_quota IS 'Automatically decrements letters_remaining when a letter is completed';

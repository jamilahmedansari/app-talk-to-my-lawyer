-- Update check_subscription_limits to use new letters_remaining field
-- This replaces the old monthly counting system with real-time quota tracking

CREATE OR REPLACE FUNCTION public.check_subscription_limits(p_user UUID)
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT letters_remaining > 0
      FROM public.subscriptions
      WHERE user_id = p_user 
        AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1
    ),
    FALSE
  );
$$;

COMMENT ON FUNCTION public.check_subscription_limits IS 'Checks if user has remaining letters in their active subscription using letters_remaining field';

-- Demo/sandbox wallet balances for ClearSend MVP UI (not a licensed custody claim).
CREATE TABLE IF NOT EXISTS public.wallet_balances (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency text NOT NULL CHECK (currency IN ('NGN', 'GHS', 'XOF')),
  amount double precision NOT NULL DEFAULT 0 CHECK (amount >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, currency)
);

CREATE INDEX IF NOT EXISTS wallet_balances_user_id_idx ON public.wallet_balances (user_id);

ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY wallet_balances_select_own
  ON public.wallet_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY wallet_balances_insert_own
  ON public.wallet_balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY wallet_balances_update_own
  ON public.wallet_balances FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.wallet_load(
  p_currency text,
  p_amount double precision
)
RETURNS public.wallet_balances
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.wallet_balances;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_currency NOT IN ('NGN', 'GHS', 'XOF') THEN
    RAISE EXCEPTION 'Invalid currency';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 100000000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  INSERT INTO public.wallet_balances (user_id, currency, amount, updated_at)
  VALUES (v_uid, p_currency, p_amount, now())
  ON CONFLICT (user_id, currency)
  DO UPDATE SET
    amount = public.wallet_balances.amount + EXCLUDED.amount,
    updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.wallet_load(text, double precision) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wallet_load(text, double precision) TO authenticated;

CREATE OR REPLACE FUNCTION public.wallet_exchange(
  p_from text,
  p_to text,
  p_amount_in double precision,
  p_amount_out double precision,
  p_fee double precision DEFAULT 0
)
RETURNS TABLE (
  from_currency text,
  from_amount double precision,
  to_currency text,
  to_amount double precision
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_from public.wallet_balances;
  v_to public.wallet_balances;
  v_available double precision;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_from NOT IN ('NGN', 'GHS', 'XOF') OR p_to NOT IN ('NGN', 'GHS', 'XOF') THEN
    RAISE EXCEPTION 'Invalid currency';
  END IF;
  IF p_from = p_to THEN
    RAISE EXCEPTION 'Currencies must differ';
  END IF;
  IF p_amount_in IS NULL OR p_amount_in <= 0 OR p_amount_out IS NULL OR p_amount_out <= 0 THEN
    RAISE EXCEPTION 'Invalid amounts';
  END IF;
  IF p_fee IS NULL OR p_fee < 0 THEN
    RAISE EXCEPTION 'Invalid fee';
  END IF;

  INSERT INTO public.wallet_balances (user_id, currency, amount)
  VALUES (v_uid, p_from, 0)
  ON CONFLICT (user_id, currency) DO NOTHING;

  SELECT * INTO v_from
  FROM public.wallet_balances
  WHERE user_id = v_uid AND currency = p_from
  FOR UPDATE;

  v_available := COALESCE(v_from.amount, 0);
  IF v_available < p_amount_in THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  UPDATE public.wallet_balances
  SET amount = amount - p_amount_in, updated_at = now()
  WHERE user_id = v_uid AND currency = p_from;

  INSERT INTO public.wallet_balances (user_id, currency, amount, updated_at)
  VALUES (v_uid, p_to, p_amount_out, now())
  ON CONFLICT (user_id, currency)
  DO UPDATE SET
    amount = public.wallet_balances.amount + EXCLUDED.amount,
    updated_at = now()
  RETURNING * INTO v_to;

  from_currency := p_from;
  from_amount := v_available - p_amount_in;
  to_currency := p_to;
  to_amount := v_to.amount;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.wallet_exchange(text, text, double precision, double precision, double precision) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wallet_exchange(text, text, double precision, double precision, double precision) TO authenticated;

-- An emergency cancellation is an explicit, auditable exception to the normal
-- 48-hour change policy. Only the server's service-role client can call the
-- function; the server separately verifies that its caller is an approved owner.
-- Repeat the cutoff function here so this migration remains safe whether the
-- preceding migration was run before or after its emergency-bypass update.
CREATE OR REPLACE FUNCTION public.enforce_booking_change_cutoff()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_departure_at timestamptz;
BEGIN
  IF OLD.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS NOT DISTINCT FROM OLD.status
     AND NEW.departure_id IS NOT DISTINCT FROM OLD.departure_id THEN
    RETURN NEW;
  END IF;

  IF current_setting('app.emergency_booking_change', true) = 'true' THEN
    RETURN NEW;
  END IF;

  SELECT (d.departure_date + d.departure_time) AT TIME ZONE 'Asia/Bishkek'
    INTO current_departure_at
    FROM public.departures d
    WHERE d.id = OLD.departure_id;

  IF current_departure_at < now() + interval '48 hours' THEN
    RAISE EXCEPTION 'BOOKING_CHANGE_CLOSED: changes close 48 hours before departure';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TABLE public.booking_change_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  actor_user_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('emergency_cancel')),
  reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 10 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX booking_change_audit_booking_created_at
  ON public.booking_change_audit (booking_id, created_at DESC);

ALTER TABLE public.booking_change_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.booking_change_audit FROM anon, authenticated;
GRANT ALL ON public.booking_change_audit TO service_role;

CREATE OR REPLACE FUNCTION public.emergency_cancel_booking(
  _booking_id uuid,
  _reason text,
  _actor_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_status text;
BEGIN
  SELECT status INTO current_status
    FROM public.bookings
    WHERE id = _booking_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'BOOKING_NOT_FOUND';
  END IF;
  IF current_status = 'cancelled' THEN
    RETURN false;
  END IF;

  -- This setting lasts only for this RPC transaction. The cutoff trigger does
  -- not bypass regular changes; it recognises this narrowly scoped exception.
  PERFORM set_config('app.emergency_booking_change', 'true', true);
  UPDATE public.bookings SET status = 'cancelled' WHERE id = _booking_id;

  INSERT INTO public.booking_change_audit (booking_id, actor_user_id, action, reason)
  VALUES (_booking_id, _actor_user_id, 'emergency_cancel', btrim(_reason));

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.emergency_cancel_booking(uuid, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emergency_cancel_booking(uuid, text, uuid) TO service_role;

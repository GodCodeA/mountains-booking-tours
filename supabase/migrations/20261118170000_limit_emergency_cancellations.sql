-- Keep the emergency exception narrow even if an approved owner invokes the
-- server endpoint directly: it applies only after regular changes close and
-- before the trip has started.
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
  current_departure_at timestamptz;
BEGIN
  SELECT b.status, (d.departure_date + d.departure_time) AT TIME ZONE 'Asia/Bishkek'
    INTO current_status, current_departure_at
    FROM public.bookings b
    JOIN public.departures d ON d.id = b.departure_id
    WHERE b.id = _booking_id
    FOR UPDATE OF b;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'BOOKING_NOT_FOUND';
  END IF;
  IF current_status = 'cancelled' THEN
    RETURN false;
  END IF;
  IF current_departure_at <= now() THEN
    RAISE EXCEPTION 'BOOKING_ALREADY_DEPARTED';
  END IF;
  IF current_departure_at >= now() + interval '48 hours' THEN
    RAISE EXCEPTION 'EMERGENCY_CANCELLATION_NOT_REQUIRED';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = _actor_user_id) THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  PERFORM set_config('app.emergency_booking_change', 'true', true);
  UPDATE public.bookings SET status = 'cancelled' WHERE id = _booking_id;

  INSERT INTO public.booking_change_audit (booking_id, actor_user_id, action, reason)
  VALUES (_booking_id, _actor_user_id, 'emergency_cancel', btrim(_reason));

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.emergency_cancel_booking(uuid, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emergency_cancel_booking(uuid, text, uuid) TO service_role;

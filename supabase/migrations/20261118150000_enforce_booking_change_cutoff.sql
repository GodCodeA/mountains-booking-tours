-- The dashboard also checks this rule, but keep it in PostgreSQL so a direct
-- server request cannot cancel or reschedule an active booking inside the
-- published 48-hour guest-change window.
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

DROP TRIGGER IF EXISTS b_bookings_enforce_change_cutoff ON public.bookings;
CREATE TRIGGER b_bookings_enforce_change_cutoff
BEFORE UPDATE OF status, departure_id ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_change_cutoff();

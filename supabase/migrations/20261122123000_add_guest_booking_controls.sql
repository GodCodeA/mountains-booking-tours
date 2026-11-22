-- Guest actions use the high-entropy confirmation reference as a bearer token.
-- The browser never receives a general booking-table read/write privilege.

CREATE TABLE IF NOT EXISTS public.booking_guest_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 2 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS booking_guest_messages_booking_created_at
  ON public.booking_guest_messages (booking_id, created_at DESC);

ALTER TABLE public.booking_guest_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.booking_guest_messages FROM anon, authenticated;
GRANT ALL ON public.booking_guest_messages TO service_role;

-- Recreate because PostgreSQL does not allow changing a function's return type.
DROP FUNCTION IF EXISTS public.get_booking_confirmation(text);

CREATE OR REPLACE FUNCTION public.get_booking_confirmation(_reference text)
RETURNS TABLE (
  reference text,
  customer_name text,
  guests integer,
  total_price integer,
  status text,
  tour_id uuid,
  departure_id uuid,
  tour_slug text,
  tour_name text,
  meeting_point text,
  image_key text,
  departure_date date,
  departure_time time
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.reference,
    b.customer_name,
    b.guests,
    b.total_price,
    b.status,
    t.id,
    d.id,
    t.slug,
    t.name,
    t.meeting_point,
    t.image_key,
    d.departure_date,
    d.departure_time
  FROM public.bookings b
  JOIN public.tours t ON t.id = b.tour_id
  JOIN public.departures d ON d.id = b.departure_id
  WHERE b.reference = upper(_reference)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_booking_confirmation(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booking_confirmation(text) TO anon, authenticated;

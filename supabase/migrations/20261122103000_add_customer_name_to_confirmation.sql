-- The confirmation link is a high-entropy, unguessable token. Expose only the
-- guest's own submitted name so the confirmation can be personalised; contact
-- details remain private and are never returned by this function.
CREATE OR REPLACE FUNCTION public.get_booking_confirmation(_reference text)
RETURNS TABLE (
  reference text,
  customer_name text,
  guests integer,
  total_price integer,
  tour_name text,
  meeting_point text,
  image_key text,
  departure_date date
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
    t.name,
    t.meeting_point,
    t.image_key,
    d.departure_date
  FROM public.bookings b
  JOIN public.tours t ON t.id = b.tour_id
  JOIN public.departures d ON d.id = b.departure_id
  WHERE b.reference = upper(_reference)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_booking_confirmation(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booking_confirmation(text) TO anon, authenticated;

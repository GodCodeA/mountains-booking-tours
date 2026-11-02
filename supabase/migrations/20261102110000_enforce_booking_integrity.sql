-- Keep core booking invariants in PostgreSQL as a final protection layer.
ALTER TABLE public.tours
  ADD CONSTRAINT tours_duration_days_positive CHECK (duration_days > 0),
  ADD CONSTRAINT tours_price_per_person_positive CHECK (price_per_person > 0),
  ADD CONSTRAINT tours_max_group_size_positive CHECK (max_group_size > 0);

ALTER TABLE public.departures
  ADD CONSTRAINT departures_total_spots_positive CHECK (total_spots > 0),
  ADD CONSTRAINT departures_spots_taken_nonnegative CHECK (spots_taken >= 0),
  ADD CONSTRAINT departures_spots_taken_within_capacity CHECK (spots_taken <= total_spots);

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_guests_positive CHECK (guests > 0),
  ADD CONSTRAINT bookings_total_price_nonnegative CHECK (total_price >= 0),
  ADD CONSTRAINT bookings_status_allowed CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  ADD CONSTRAINT bookings_customer_name_length CHECK (char_length(btrim(customer_name)) BETWEEN 2 AND 100),
  ADD CONSTRAINT bookings_customer_email_length CHECK (char_length(btrim(customer_email)) BETWEEN 3 AND 255),
  ADD CONSTRAINT bookings_customer_phone_length CHECK (char_length(btrim(customer_phone)) BETWEEN 6 AND 20),
  ADD CONSTRAINT bookings_customer_whatsapp_length CHECK (
    customer_whatsapp IS NULL OR char_length(btrim(customer_whatsapp)) BETWEEN 6 AND 20
  ),
  ADD CONSTRAINT bookings_notes_length CHECK (notes IS NULL OR char_length(btrim(notes)) <= 500);

-- Foreign keys alone cannot ensure that a booking's departure belongs to its tour.
-- This trigger also keeps the persisted price derived from the canonical tour price.
CREATE OR REPLACE FUNCTION public.validate_booking_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  departure_tour_id uuid;
  canonical_price integer;
BEGIN
  SELECT d.tour_id, t.price_per_person
    INTO departure_tour_id, canonical_price
    FROM public.departures d
    JOIN public.tours t ON t.id = d.tour_id
    WHERE d.id = NEW.departure_id;

  IF departure_tour_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_DEPARTURE: departure does not exist';
  END IF;
  IF NEW.tour_id <> departure_tour_id THEN
    RAISE EXCEPTION 'INVALID_DEPARTURE: departure belongs to a different tour';
  END IF;

  NEW.total_price := NEW.guests * canonical_price;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.validate_booking_integrity() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS a_bookings_validate_integrity ON public.bookings;
CREATE TRIGGER a_bookings_validate_integrity
BEFORE INSERT OR UPDATE OF tour_id, departure_id, guests, total_price ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.validate_booking_integrity();

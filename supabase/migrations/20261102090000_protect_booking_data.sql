-- Booking records contain customer PII. They must never be readable or writable
-- through the public API. Dashboard access is limited to explicitly approved users.
CREATE TABLE public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.admin_users TO authenticated;
CREATE POLICY "Administrators can read their own membership"
  ON public.admin_users FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_booking_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_booking_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_booking_admin() TO authenticated;

DROP POLICY IF EXISTS "Bookings are readable (demo)" ON public.bookings;
DROP POLICY IF EXISTS "Bookings can be updated (demo)" ON public.bookings;
REVOKE SELECT, UPDATE ON public.bookings FROM anon, authenticated;
GRANT SELECT, UPDATE ON public.bookings TO authenticated;

CREATE POLICY "Booking administrators can read bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (public.is_booking_admin());
CREATE POLICY "Booking administrators can update bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (public.is_booking_admin())
  WITH CHECK (public.is_booking_admin());

-- A reference is a bearer token for the minimal confirmation view, so use
-- enough entropy to make it unguessable. Existing demo references are rotated.
ALTER TABLE public.bookings
  ALTER COLUMN reference SET DEFAULT upper(
    replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
  );
UPDATE public.bookings
  SET reference = upper(
    replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
  );

-- This is deliberately narrower than a table SELECT: it exposes only the
-- fields needed by the guest confirmation page, never contact details.
CREATE OR REPLACE FUNCTION public.get_booking_confirmation(_reference text)
RETURNS TABLE (
  reference text,
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

-- After creating the owner in Supabase Auth, add their UUID in the SQL editor:
-- INSERT INTO public.admin_users (user_id) VALUES ('owner-auth-user-uuid');

-- All booking mutations now run in server functions with the service-role key.
-- The browser must not receive direct privileges over customer records.
DROP POLICY IF EXISTS "Bookings can be created (demo)" ON public.bookings;
DROP POLICY IF EXISTS "Booking administrators can read bookings" ON public.bookings;
DROP POLICY IF EXISTS "Booking administrators can update bookings" ON public.bookings;
REVOKE ALL ON public.bookings FROM anon, authenticated;

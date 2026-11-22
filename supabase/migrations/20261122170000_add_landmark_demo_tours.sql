-- A fourth wave of fictional, non-production tour inventory.
-- Replace all data in this file with verified operations data before launch.
INSERT INTO public.tours (
  slug, name, summary, description, region, difficulty, duration_days,
  price_per_person, max_group_size, highlights, included, not_included,
  meeting_point, image_key, sort_order
) VALUES
  (
    'lenin-peak-base-camp', 'Lenin Peak Base Camp Trek',
    'A high-altitude trek beneath one of the Pamirs’ most dramatic peaks.',
    'A five-day demo itinerary from Osh to the Achik-Tash valley and the Lenin Peak base-camp area. This is not a summit climb: it is a demanding high-altitude trek for properly prepared guests, with camp nights and changing mountain weather.',
    'Osh', 'Challenging', 5, 520, 6,
    ARRAY['Achik-Tash alpine valley', 'Views toward Lenin Peak', 'High-altitude camp nights'],
    ARRAY['Transport from Osh', 'Mountain guide', 'Camping equipment', 'All meals on trek'],
    ARRAY['Personal sleeping bag', 'Insurance', 'Tips'],
    'Osh city centre — 07:00', 'lenin-peak-base-camp', 14
  ),
  (
    'sary-chelek-lake-escape', 'Sary-Chelek Lake Escape',
    'A slow three-day escape to a forest lake in western Kyrgyzstan.',
    'This demo route heads from Osh into the Sary-Chelek biosphere reserve area for lakeside walks, forest views and a quiet guesthouse stay. It is designed for people who want nature and long scenic drives rather than a demanding trek.',
    'Jalal-Abad', 'Easy', 3, 290, 8,
    ARRAY['Sary-Chelek lake viewpoints', 'Forest and lakeside walks', 'Small village guesthouse'],
    ARRAY['Transport from Osh', 'Guide', '2 guesthouse nights', 'Breakfasts and dinners'],
    ARRAY['Lunches', 'Reserve entry where required', 'Insurance', 'Tips'],
    'Osh city centre — 08:00', 'sary-chelek', 15
  ),
  (
    'tash-rabat-caravanserai', 'Tash Rabat Caravanserai Journey',
    'Silk Road stonework, open Naryn valleys and a yurt night near Tash Rabat.',
    'Travel south from Naryn through wide high-altitude valleys to Tash Rabat, the stone caravanserai near the old Silk Road route. The pace is gentle, with time around the monument and an overnight in a simple yurt camp.',
    'Naryn', 'Easy', 2, 220, 8,
    ARRAY['Tash Rabat stone caravanserai', 'High-altitude Naryn valleys', 'Yurt-camp evening'],
    ARRAY['Transport from Naryn', 'Guide', '1 night in a yurt', 'Dinner and breakfast'],
    ARRAY['Lunches', 'Insurance', 'Tips'],
    'Naryn city centre — 09:00', 'tash-rabat', 16
  ),
  (
    'kochkor-felt-culture-day', 'Kochkor Felt & Craft Day',
    'A hands-on day of felt craft, local food and village stories in Kochkor.',
    'This calm cultural day is deliberately different from the hiking routes: meet a local craft host, learn the stages of a small felt piece, share a home-style lunch and take a short walk through the village. It is a demo experience, not a claim of a specific workshop partnership.',
    'Naryn', 'Easy', 1, 85, 10,
    ARRAY['Felt-making introduction', 'Home-style lunch', 'Kochkor village walk'],
    ARRAY['Craft host and translator-guide', 'Materials for a small felt piece', 'Lunch and tea'],
    ARRAY['Transport to Kochkor', 'Insurance', 'Tips'],
    'Kochkor central square — 09:00', 'kochkor-felt', 17
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, summary = EXCLUDED.summary, description = EXCLUDED.description,
  region = EXCLUDED.region, difficulty = EXCLUDED.difficulty, duration_days = EXCLUDED.duration_days,
  price_per_person = EXCLUDED.price_per_person, max_group_size = EXCLUDED.max_group_size,
  highlights = EXCLUDED.highlights, included = EXCLUDED.included, not_included = EXCLUDED.not_included,
  meeting_point = EXCLUDED.meeting_point, image_key = EXCLUDED.image_key, sort_order = EXCLUDED.sort_order;

INSERT INTO public.departures (tour_id, departure_date, total_spots, spots_taken)
SELECT t.id, dates.departure_date, t.max_group_size, 0
FROM public.tours t
JOIN (VALUES
  ('lenin-peak-base-camp', CURRENT_DATE + 35),
  ('lenin-peak-base-camp', CURRENT_DATE + 70),
  ('sary-chelek-lake-escape', CURRENT_DATE + 17),
  ('sary-chelek-lake-escape', CURRENT_DATE + 45),
  ('tash-rabat-caravanserai', CURRENT_DATE + 24),
  ('tash-rabat-caravanserai', CURRENT_DATE + 52),
  ('kochkor-felt-culture-day', CURRENT_DATE + 10),
  ('kochkor-felt-culture-day', CURRENT_DATE + 31)
) AS dates(slug, departure_date) ON dates.slug = t.slug
ON CONFLICT (tour_id, departure_date) DO NOTHING;

INSERT INTO public.bookings (
  tour_id, departure_id, customer_name, customer_email, customer_phone,
  guests, total_price, status, notes
)
SELECT t.id, d.id, s.customer_name, s.customer_email, s.customer_phone,
       s.guests, s.guests * t.price_per_person, 'confirmed', 'Demo sample booking'
FROM (VALUES
  ('lenin-peak-base-camp', CURRENT_DATE + 35, 'Daniyar Abdyldaev', 'daniyar.demo@example.com', '+996 700 551 028', 1),
  ('sary-chelek-lake-escape', CURRENT_DATE + 17, 'Mila Kuznetsova', 'mila.demo@example.com', '+7 747 221 0655', 2),
  ('tash-rabat-caravanserai', CURRENT_DATE + 24, 'Amina Rakhimova', 'amina.demo@example.com', '+996 555 448 317', 2),
  ('kochkor-felt-culture-day', CURRENT_DATE + 10, 'Eleanor Hayes', 'eleanor.demo@example.com', '+44 7700 900982', 1)
) AS s(slug, departure_date, customer_name, customer_email, customer_phone, guests)
JOIN public.tours t ON t.slug = s.slug
JOIN public.departures d ON d.tour_id = t.id AND d.departure_date = s.departure_date
WHERE NOT EXISTS (
  SELECT 1 FROM public.bookings b WHERE b.departure_id = d.id AND b.customer_email = s.customer_email
);

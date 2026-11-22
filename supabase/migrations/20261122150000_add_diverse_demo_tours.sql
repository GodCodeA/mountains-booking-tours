-- Additional fictional inventory for the non-production demo.
-- Replace tours, dates, prices, contacts and sample bookings before launch.
INSERT INTO public.tours (
  slug, name, summary, description, region, difficulty, duration_days,
  price_per_person, max_group_size, highlights, included, not_included,
  meeting_point, image_key, sort_order
) VALUES
  (
    'burana-konorchek-day', 'Burana & Konorchek Day',
    'Silk Road history and a red-rock canyon in one easy day from Bishkek.',
    'A relaxed day east of Bishkek combining the Burana archaeological complex with a walk in the red sandstone landscapes of Konorchek. It is a low-commitment choice for travellers who want history, open views and a gentle canyon walk without an overnight stay.',
    'Chuy', 'Easy', 1, 70, 10,
    ARRAY['Burana Tower and Balasagun site', 'Konorchek red-rock canyon', 'Picnic with mountain views'],
    ARRAY['Transport from Bishkek', 'Guide', 'Site entry', 'Picnic and tea'],
    ARRAY['Personal snacks', 'Insurance', 'Tips'],
    'Ala-Too Square, Bishkek — 08:00', 'burana-konorchek', 11
  ),
  (
    'jeti-oguz-barskoon-escape', 'Jeti-Oguz & Barskoon Escape',
    'Red cliffs, waterfall walks and a quiet night in eastern Issyk-Kul.',
    'Travel from Karakol into two of the region’s best-known valleys: the red rock formations of Jeti-Oguz and the forested waterfalls of Barskoon. This is a moderate, scenic overnight for people who prefer short walks, dramatic landscapes and a guesthouse evening to a hard trek.',
    'Issyk-Kul', 'Moderate', 2, 190, 8,
    ARRAY['Jeti-Oguz Seven Bulls cliffs', 'Barskoon waterfall walk', 'Guesthouse night near Karakol'],
    ARRAY['Transport from Karakol', 'Guide', '1 guesthouse night', 'Dinner and breakfast'],
    ARRAY['Lunches', 'Insurance', 'Tips'],
    'Karakol central mosque — 08:30', 'jeti-oguz-barskoon', 12
  ),
  (
    'arslanbob-walnut-forest', 'Arslanbob Walnut Forest Escape',
    'Forest trails, waterfall views and village life in southern Kyrgyzstan.',
    'Arslanbob pairs one of the country’s most distinctive village landscapes with calm forest walks and waterfall viewpoints. Over three unhurried days, stay with a local host, explore the walnut forest and see a side of Kyrgyzstan far from the busy northern routes.',
    'Jalal-Abad', 'Easy', 3, 245, 8,
    ARRAY['Walnut forest walks', 'Arslanbob waterfall viewpoints', 'Village guesthouse stay'],
    ARRAY['Transport from Osh', 'Guide', '2 guesthouse nights', 'Breakfasts and dinners'],
    ARRAY['Lunches', 'Insurance', 'Tips'],
    'Osh city centre — 08:00', 'arslanbob', 13
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
  ('burana-konorchek-day', CURRENT_DATE + 6),
  ('burana-konorchek-day', CURRENT_DATE + 27),
  ('jeti-oguz-barskoon-escape', CURRENT_DATE + 14),
  ('jeti-oguz-barskoon-escape', CURRENT_DATE + 42),
  ('arslanbob-walnut-forest', CURRENT_DATE + 21),
  ('arslanbob-walnut-forest', CURRENT_DATE + 49)
) AS dates(slug, departure_date) ON dates.slug = t.slug
ON CONFLICT (tour_id, departure_date) DO NOTHING;

-- Fictional Owner-dashboard examples; these are clearly demo records.
INSERT INTO public.bookings (
  tour_id, departure_id, customer_name, customer_email, customer_phone,
  guests, total_price, status, notes
)
SELECT t.id, d.id, s.customer_name, s.customer_email, s.customer_phone,
       s.guests, s.guests * t.price_per_person, 'confirmed', 'Demo sample booking'
FROM (VALUES
  ('burana-konorchek-day', CURRENT_DATE + 6, 'Aibek Sadykov', 'aibek.demo@example.com', '+996 555 220 611', 2),
  ('jeti-oguz-barskoon-escape', CURRENT_DATE + 14, 'Sofia Ivanova', 'sofia.demo@example.com', '+7 701 251 4020', 2),
  ('arslanbob-walnut-forest', CURRENT_DATE + 21, 'James Carter', 'james.demo@example.com', '+44 7700 900812', 1)
) AS s(slug, departure_date, customer_name, customer_email, customer_phone, guests)
JOIN public.tours t ON t.slug = s.slug
JOIN public.departures d ON d.tour_id = t.id AND d.departure_date = s.departure_date
WHERE NOT EXISTS (
  SELECT 1 FROM public.bookings b WHERE b.departure_id = d.id AND b.customer_email = s.customer_email
);

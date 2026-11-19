-- Additional sample inventory for the non-production demo. These tours, dates
-- and owner bookings are fictional examples and must be replaced before launch.
INSERT INTO public.tours (
  slug, name, summary, description, region, difficulty, duration_days,
  price_per_person, max_group_size, highlights, included, not_included,
  meeting_point, image_key, sort_order
) VALUES
  (
    'chon-kemin-valley-escape', 'Chon-Kemin Valley Escape',
    'Two quiet days among spruce forest, river valleys and high pasture.',
    'Chon-Kemin is a broad green valley east of Bishkek where spruce-covered slopes meet a clear river and summer pasture reaches towards snow peaks. Stay in a family guesthouse, walk at an unhurried pace and spend an evening close to the mountains.',
    'Chuy', 'Easy', 2, 145, 8,
    ARRAY['Chon-Kemin river and spruce forest', 'Family guesthouse stay', 'Easy jailoo walk'],
    ARRAY['Transport from Bishkek', 'Guide', '1 night in a guesthouse', 'Dinner and breakfast'],
    ARRAY['Lunch on the road', 'Insurance', 'Tips'],
    'Ala-Too Square, Bishkek — 08:00', 'chon-kemin', 7
  ),
  (
    'kegety-waterfall-hike', 'Kegety Waterfall Hike',
    'A full day walking to a tall waterfall in a green mountain gorge.',
    'Kegety is one of the closest gorges to Bishkek with a fast-running stream, spruce-covered slopes and a tall waterfall hidden deeper in the valley. It is an active but approachable day on the trail with time for tea and a picnic.',
    'Chuy', 'Moderate', 1, 65, 10,
    ARRAY['Kegety waterfall', 'Mountain-stream trail', 'Picnic in the gorge'],
    ARRAY['Transport from Bishkek', 'Mountain guide', 'Picnic and tea', 'First-aid kit'],
    ARRAY['Personal snacks', 'Insurance', 'Tips'],
    'Ala-Too Square, Bishkek — 07:00', 'kegety', 8
  ),
  (
    'suusamyr-jailoo-weekend', 'Suusamyr Jailoo Weekend',
    'Two days in a yurt on a wide high-altitude summer pasture.',
    'The Suusamyr Valley is known for open pasture, soft green ridges and huge skies. Over two days, get a gentle introduction to jailoo life, walk without rushing and sleep in a simple yurt camp.',
    'Chuy', 'Easy', 2, 160, 8,
    ARRAY['Night in a traditional yurt', 'Easy pasture walks', 'Sunset over the valley'],
    ARRAY['Transport from Bishkek', 'Guide', '1 night in a yurt', 'All meals'],
    ARRAY['Alcohol', 'Insurance', 'Tips'],
    'Ala-Too Square, Bishkek — 08:00', 'suusamyr', 9
  ),
  (
    'karakol-lakes-trek', 'Karakol Lakes Trek',
    'A three-day trek to high alpine lakes above Karakol.',
    'This route climbs from the Karakol valley to cold alpine lakes beneath the rugged Terskey Ala-Too. It is an active three-day trek with camp nights, elevation gain and the feeling of truly remote mountains.',
    'Issyk-Kul', 'Challenging', 3, 310, 6,
    ARRAY['High alpine Karakol lakes', 'Tent-camp nights', 'Terskey Ala-Too panoramas'],
    ARRAY['Transport from Karakol', 'Guide', 'Camping equipment', 'All meals'],
    ARRAY['Sleeping bag', 'Insurance', 'Tips'],
    'Karakol central mosque — 08:00', 'karakol-lakes', 10
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  region = EXCLUDED.region,
  difficulty = EXCLUDED.difficulty,
  duration_days = EXCLUDED.duration_days,
  price_per_person = EXCLUDED.price_per_person,
  max_group_size = EXCLUDED.max_group_size,
  highlights = EXCLUDED.highlights,
  included = EXCLUDED.included,
  not_included = EXCLUDED.not_included,
  meeting_point = EXCLUDED.meeting_point,
  image_key = EXCLUDED.image_key,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.departures (tour_id, departure_date, total_spots, spots_taken)
SELECT t.id, departures.departure_date, t.max_group_size, 0
FROM public.tours t
JOIN (
  VALUES
    ('chon-kemin-valley-escape', CURRENT_DATE + 12),
    ('chon-kemin-valley-escape', CURRENT_DATE + 33),
    ('kegety-waterfall-hike', CURRENT_DATE + 9),
    ('kegety-waterfall-hike', CURRENT_DATE + 23),
    ('suusamyr-jailoo-weekend', CURRENT_DATE + 16),
    ('suusamyr-jailoo-weekend', CURRENT_DATE + 37),
    ('karakol-lakes-trek', CURRENT_DATE + 20),
    ('karakol-lakes-trek', CURRENT_DATE + 48)
) AS departures(slug, departure_date) ON departures.slug = t.slug
ON CONFLICT (tour_id, departure_date) DO NOTHING;

-- One clearly labelled sample reservation per new tour lets the Owner dashboard
-- exercise the same filters, rescheduling and cancellation paths as real data.
INSERT INTO public.bookings (
  tour_id, departure_id, customer_name, customer_email, customer_phone,
  guests, total_price, status, notes
)
SELECT t.id, d.id, samples.customer_name, samples.customer_email, samples.customer_phone,
       samples.guests, samples.guests * t.price_per_person, 'confirmed', 'Demo sample booking'
FROM (
  VALUES
    ('chon-kemin-valley-escape', CURRENT_DATE + 12, 'Elena Petrova', 'elena.demo@example.com', '+996 555 102 501', 2),
    ('kegety-waterfall-hike', CURRENT_DATE + 9, 'Noah Williams', 'noah.demo@example.com', '+44 7700 900777', 1),
    ('suusamyr-jailoo-weekend', CURRENT_DATE + 16, 'Aizada Bekova', 'aizada.demo@example.com', '+996 700 444 122', 3),
    ('karakol-lakes-trek', CURRENT_DATE + 20, 'Mina Park', 'mina.demo@example.com', '+82 10 2400 7312', 2)
) AS samples(slug, departure_date, customer_name, customer_email, customer_phone, guests)
JOIN public.tours t ON t.slug = samples.slug
JOIN public.departures d ON d.tour_id = t.id AND d.departure_date = samples.departure_date
WHERE NOT EXISTS (
  SELECT 1 FROM public.bookings b
  WHERE b.departure_id = d.id AND b.customer_email = samples.customer_email
);

# Ala-Too Adventures

A guided mountain adventure booking platform for discovering tours, checking real availability and booking trips online.

## Purpose

Ala-Too Adventures is a small mountain tour business in Bishkek, Kyrgyzstan, run by one owner. The app turns "Can I book this tour?" into "You're booked" with minimal manual work.

## Main features

- Six guided tours with details, inclusions and pricing
- Live availability per departure (fully booked or past dates can't be selected)
- Four-step booking flow with inline validation
- Booking confirmation page with a booking reference
- Owner dashboard: today / upcoming / all bookings, reschedule, cancel, reminder status

## Tech stack

React 19, TypeScript, TanStack Start/Router, Vite, Tailwind CSS v4, shadcn/ui, Lucide icons, zod.

## Data (Lovable Cloud / Supabase)

- `tours`, `departures`, `bookings` tables
- A database trigger keeps `departures.spots_taken` in sync and blocks overbooking
- Database constraints enforce valid guest counts, capacities, statuses and customer field lengths; a trigger verifies that every departure belongs to its booked tour and calculates the stored total
- The dashboard refreshes after booking, cancellation and rescheduling operations
- The browser can read only public tours and departures; booking creation and owner operations run in protected server functions
- Departure dates and reminder timestamps are evaluated and shown in `Asia/Bishkek`, independent of the visitor's browser time zone

## Booking flow

Home → Tours → Tour details → Date → Guests → Contact details → Review → Confirm → Confirmation.
No payment is taken online; guests pay on the day.

## Owner dashboard

`/dashboard` lists bookings with customer contact details, guest counts and status, and supports reschedule and cancel. It is available only to a signed-in account listed in `admin_users`; sign-in uses a Supabase email magic link. Email reminders are not configured yet — the button reports this honestly.

After creating the owner account in Supabase Auth, add its UUID in the SQL editor:

```sql
INSERT INTO public.admin_users (user_id) VALUES ('owner-auth-user-uuid');
```

Public confirmation links use a long random booking reference and reveal only trip details, never contact information.

## Development

```sh
bun install
bun run dev
bun run build
bun run lint
```

## Production checklist

- Apply all migrations in `supabase/migrations` in order.
- Configure `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and the server-only `SUPABASE_SERVICE_ROLE_KEY` in the deployment environment.
- Configure the Supabase Auth redirect URL for `https://your-domain/dashboard` and add the owner UUID to `admin_users`.
- Configure a transactional email provider before enabling real reminder sending.
- The booking form includes a honeypot and a per-email limit of three attempts per 15 minutes; add a CAPTCHA provider if public traffic grows.

## Deploy to Cloudflare Workers

This repository builds to a Cloudflare Worker through Nitro. The generated Worker configuration is written to `.output/server/wrangler.json` during the build.

1. In Cloudflare, create a Worker from this GitHub repository, or deploy locally with `bun run deploy:cloudflare` after `wrangler login`.
2. Add `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` as Worker secrets. Do not commit them.
3. Make the public `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` available during the Worker build, because Vite embeds `VITE_*` values into the browser bundle. The service-role key must remain runtime-only.
4. Deploy, then add the Worker domain as an allowed redirect URL in Supabase Auth. Add the custom domain there too before switching DNS.

Cloudflare Pages is not used: Workers hosts both the React interface and the server functions.

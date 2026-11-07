# Ala-Too Adventures

A mountain-tour booking platform for a small owner-run tour business in Bishkek, Kyrgyzstan. It turns “Can I book this tour?” into a confirmed booking with minimal manual work: guests browse trips, see dates and remaining capacity, make a booking, and receive a private confirmation link. The owner has a separate authenticated dashboard for managing bookings.

## Live demo

[Open Ala-Too Adventures](https://mountains-booking-tours.bishkek-2020.workers.dev/)

## Project status

**Demo / not production-ready.** Tours, dates, guides, reviews, contacts and bookings are sample data. Online payments and transactional email delivery are not configured. Complete the production checklist and replace all sample content before accepting real customer bookings.

## Main features

- Six guided tours with details, inclusions and pricing
- Live availability per departure (fully booked or past dates can't be selected)
- Four-step booking flow with inline validation
- Booking confirmation page with a booking reference
- Owner dashboard: today / upcoming / all bookings, reschedule, cancel, reminder status
- English/Russian language switcher. It translates navigation, home content, sample reviews and FAQ, tour cards, filters, tour details, packing lists, booking flow, confirmation, and owner dashboard
- Dates are formatted in the selected language while all departure logic remains on Bishkek time

## Tech stack

React 19, TypeScript, TanStack Start/Router, Vite, Tailwind CSS v4, shadcn/ui, Lucide icons, zod.

## Data (Supabase)

- `tours`, `departures`, `bookings` tables
- A database trigger keeps `departures.spots_taken` in sync and blocks overbooking
- Database constraints enforce valid guest counts, capacities, statuses and customer field lengths; a trigger verifies that every departure belongs to its booked tour and calculates the stored total
- The dashboard refreshes after booking, cancellation and rescheduling operations
- The browser can read only public tours and departures; booking creation and owner operations run in protected server functions
- Departure dates and reminder timestamps are evaluated and shown in `Asia/Bishkek`, independent of the visitor's browser time zone

## Booking flow

Home → Tours → Tour details → Date → Guests → Contact details → Review → Confirm → Confirmation.
No payment is taken online; guests pay on the day.

## Languages

The language control in the site header switches between English and Russian. The selection is stored in the visitor's browser, so it stays selected after navigation and refreshes.

Tour records remain canonical in Supabase in English. Russian display copy for the six current sample tours lives in `src/lib/tour-localization.ts`; homepage sample reviews, countries, guides and FAQ are in `src/lib/site-content.ts`; itinerary and packing-list translations are in `src/lib/tour-content.ts`.

When adding a real tour, add its Russian display copy in those files before presenting it as fully bilingual. Real customer reviews should normally be shown in their original language, with a clearly labelled translation only when one is provided.

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
bun run typecheck
bun run test
```

`npm run build`, `npm run typecheck` and `npm test` work too if Bun is not installed.

Create local configuration outside Git. Never put real secrets in source code or a committed `.env` file:

```dotenv
# Browser build-time values. These are public by design.
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Server/Worker runtime values. Keep the service key secret.
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

`VITE_*` variables become part of the browser bundle. Never use the service-role key with a `VITE_` prefix.

## Production checklist

- Apply all migrations in `supabase/migrations` in order.
- Configure `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and the server-only `SUPABASE_SERVICE_ROLE_KEY` in the deployment environment.
- Configure the Supabase Auth redirect URL for `https://your-domain/dashboard` and add the owner UUID to `admin_users`.
- Configure a transactional email provider before enabling real reminder sending.
- The booking form includes a honeypot and a per-email limit of three attempts per 15 minutes; add a CAPTCHA provider if public traffic grows.
- Replace sample tours, guides, reviews, contact details and placeholder email addresses before a real launch.

## Deploy to Cloudflare Workers

This repository builds to a Cloudflare Worker through Nitro. The generated Worker configuration is written to `.output/server/wrangler.json` during the build.

1. In Cloudflare, create a Worker from this GitHub repository, or deploy locally with `bun run deploy:cloudflare` after `wrangler login`.
2. Add runtime values to the Worker: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and secret `SUPABASE_SERVICE_ROLE_KEY`. Do not put the service-role key in the repository or in a Vite variable.
3. Make the public `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` available during the Worker build, because Vite embeds `VITE_*` values into the browser bundle.
4. Deploy, then add the Worker domain as an allowed redirect URL in Supabase Auth. Add the custom domain there too before switching DNS.

The generated Wrangler configuration has `keep_vars: true`. This is intentional: it prevents a Git/CLI deployment from deleting runtime values you added in the Cloudflare dashboard. A new or edited runtime value still requires a new deployment before the Worker can use it.

Cloudflare Pages is not used: Workers hosts both the React interface and the server functions.

## Reminders

The database can safely identify and claim bookings due for a reminder, and the dashboard exposes a manual reminder action. Email delivery is deliberately not configured yet: attempts are recorded as failed rather than pretending an email was sent.

Before enabling reminders for real customers, connect a transactional email provider (for example Resend), verify a domain you control, add its server-only API key as a Cloudflare secret, implement delivery in `src/lib/reminders.server.ts`, and invoke the reminder processor from a protected scheduled Worker job. Test delivery with an address you control before enabling it for customers.

## Useful project locations

| Location | Responsibility |
| --- | --- |
| `src/lib/bookings.ts` | Supabase queries, protected booking/owner server functions, capacity helpers |
| `src/lib/tour-localization.ts` | Russian display copy for core tour facts |
| `src/lib/tour-content.ts` | Itineraries, packing lists and cancellation policy |
| `src/lib/site-content.ts` | Sample guides, reviews and FAQ |
| `supabase/migrations/` | Database schema, capacity trigger and security policy migrations |
| `src/routes/dashboard.tsx` | Authenticated owner dashboard |

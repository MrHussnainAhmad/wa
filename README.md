# Waqas Advertisers

Outdoor advertising marketplace for [waqasadvertisers](https://waqasadvertisers.com) — public site + admin panel.

## Stack

- Next.js 16 (App Router)
- MongoDB + Mongoose
- Auth.js (credentials sessions)
- Cloudinary (optional)
- Resend (optional)

## Setup

1. Copy `.env.example` → `.env` and set `MONGODB_URI`
2. `npm install`
3. `npm run seed`
4. `npm run dev`

### Seed accounts

- Super admin: `admin@waqasadvertisers.com` / `admin123`
- Sales: `sales@waqasadvertisers.com` / `sales123`

- Admin login: `/login/admin`
- Sales login: `/login`

## Automation (no AI / no WhatsApp Business API)

Uses **email** (Resend, if `RESEND_API_KEY` is set) + **normal WhatsApp links** (`wa.me`).

1. New lead → email to `ADMIN_NOTIFY_EMAIL` with a one-click WhatsApp link to that lead.
2. Quote/contact forms → optional **Continue on WhatsApp** (opens chat to your company number from Settings).
3. Admin Leads / Dashboard → **WhatsApp this lead** buttons.
4. Daily cron syncs board availability + emails ending-soon bookings, new leads, and stale NEW leads.
5. Optional WhatsApp Cloud API automation (admin Settings): queues follow-ups with delay + rate limits; process via `/api/cron/whatsapp-queue`.

Schedule free at [cron-job.org](https://cron-job.org) (daily):

```
GET https://YOUR_DOMAIN/api/cron/daily-ops
Header: x-cron-secret: YOUR_CRON_SECRET
```

WhatsApp queue (every 10–15 minutes, only if enabled in Settings):

```
GET https://YOUR_DOMAIN/api/cron/whatsapp-queue
Header: x-cron-secret: YOUR_CRON_SECRET
```

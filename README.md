## XO Gaming - Gaming Center Reservations (No User Login)

Modern reservation platform for 10 PCs and 4 PS5 stations.

- Customers do not create accounts and do not log in.
- Booking flow: choose device -> choose date/time -> choose duration -> enter name -> submit.
- Only admins log in through Supabase Auth to manage reservations/devices/maintenance.
- Built for free-tier deployment on Vercel + Supabase Free Plan.

---

## Features

### Public booking
- Live device availability on the homepage.
- FullCalendar live schedule with blocked slots + existing reservations.
- Fast booking form with required fields:
  - `customer_name`
  - `selected_device`
  - `reservation_date/start_time`
  - `duration (1-12h)`
- Optional fields: phone, discord, notes.

### Admin
- Supabase email/password sign-in with session persistence.
- Overview dashboard with active devices, upcoming bookings, and maintenance counts.
- Reservations table with filters (date, device, status) and full CRUD.
- Device management (online/offline toggle).
- Blocked-slot (maintenance) management.

### Rules
- Overlap prevented using:
  - `newStart < existingEnd && newEnd > existingStart`
- Minimum 1 hour, maximum 12 hours.
- Booking blocked when colliding with maintenance windows.

---

## Project Structure

```
app/
  (public)/         Customer-facing routes (home, /book)
  admin/
    login/          Public admin sign-in page
    (protected)/    Authenticated admin dashboard routes
  api/availability  JSON endpoint feeding FullCalendar
  layout.tsx        Root layout, metadata, animated background
  globals.css       Theme + FullCalendar dark overrides
actions/            Server actions (reservations, devices, blocked slots, auth)
components/
  ui/               shadcn-style primitives (Button, Card, Dialog, ...)
  layout/           Navbar, Footer
  booking/          BookingForm, CalendarView
  admin/            Sidebar, dialogs, filters, toggles
  ...               StatsCards, DeviceCard, ReservationCard, AnimatedBackground
hooks/              Reusable client hooks (useMediaQuery)
lib/
  supabase/         Browser, server, middleware, and data helpers
  reservations/     Domain logic (conflicts, schemas, availability)
  auth.ts           getAdminUser / requireAdmin helpers
  dates.ts          Formatting helpers
  queries.ts        Safe DB read helpers used by public pages
  env.ts            Optional env validation
supabase/
  schema.sql        SQL schema + seed data + RLS policies
types/              Shared TypeScript types
styles/             Reserved for future static styles
```

---

## Local Setup

### 1. Prerequisites
- Node.js 20+
- Supabase project (Auth + Postgres)

### 2. Install
```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```
Only these two variables are required.

### 4. Create tables + seed devices

Open Supabase SQL Editor and run `supabase/schema.sql`.

### 5. Create the Admin User

In the Supabase dashboard:
1. Go to **Authentication -> Users -> Add user**.
2. Use **Create new user** and set an email + password.
3. Confirm the user (toggle "Auto Confirm User" or click the confirmation email).

Now you can sign in at `/admin/login`.

> If you want to gate sign-in further (e.g. only allow specific emails), update `lib/auth.ts` to check `user.email` against an allowlist before returning the user.

### 6. Run

```bash
npm run dev
```

Visit:
- `http://localhost:3000` - public homepage
- `http://localhost:3000/book` - booking flow
- `http://localhost:3000/admin/login` - admin sign-in

---

## Reservation Rules

Defined in `lib/reservations/`:

| Rule | Where |
|------|-------|
| Minimum 1 hour, maximum 12 hours | `constants.ts`, `conflicts.ts` |
| Conflict detection: `newStart < existingEnd && newEnd > existingStart` | `conflicts.ts` |
| Cancelled / completed reservations do not block new bookings | `availability.ts` |
| Blocked slots also count as conflicts | `availability.ts` |
| End must be after start | `schemas.ts` |

The same rules are applied on the client (Zod schema) and the server (server actions + DB-aware availability check).

---

## Deployment

### Vercel + Supabase (free tier)

1. Push repo to GitHub.
2. Import project in Vercel.
3. Add env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) + custom dark/neon theme
- [Supabase](https://supabase.com/) (Auth + PostgreSQL hosting)
- [shadcn/ui](https://ui.shadcn.com/) (UI primitives, customised)
- [FullCalendar](https://fullcalendar.io/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/) (validation)
- [Sonner](https://sonner.emilkowal.ski/) (toasts)
- [Lucide](https://lucide.dev/) (icons)

---

## SQL Schema

All required tables and seed data are provided in `supabase/schema.sql`:
- `devices`
- `reservations`
- `blocked_slots`


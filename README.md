# Bavaria-tur sommeren 2026

Liten nettside for sommerturen med S/Y Bavaria 37 fra Oksval (Nesodden) via
sørlandskysten og svenskekysten, 28. juni – 15. juli 2026. Venner kan lese
reiseruten, se båten, og bestille lugar for de dagene de vil være med.

- **Stack:** Next.js 16 (App Router) + TypeScript + Tailwind v4
- **Backend:** Supabase (Postgres)
- **Auth:** Delt passord, én streng som alle vennene får i gruppechatten
- **Deploy:** Vercel

## Førstegangsoppsett

### 1. Supabase

1. Logg inn på <https://supabase.com> og opprett et nytt prosjekt (gratis-tier holder).
2. Når prosjektet er klart, åpne **SQL Editor** og kjør innholdet i:
   - `supabase/migrations/0001_init.sql` (tabeller + RLS)
   - `supabase/migrations/0002_seed.sql` (lugarer + skissert reiserute)
3. Gå til **Project Settings → API** og kopier:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

> Service-role-nøkkelen omgår RLS. Den må aldri eksponeres til klienten, den
> brukes kun fra server actions.

### 2. Lokalt

```bash
cp .env.example .env.local
# fyll inn verdiene fra Supabase + velg et delt passord i TRIP_PASSWORD
npm install
npm run dev
```

Åpne <http://localhost:3000>.

### 3. Vercel

1. Kjør `npx vercel` i prosjektmappen og følg dialogen (eller importer GitHub-repoet
   via <https://vercel.com/new>).
2. I Vercel-prosjektet, gå til **Settings → Environment Variables** og legg inn de
   fire variablene fra `.env.example`. Sett dem på `Production` og `Preview`.
3. Deploy. Vercel bygger og pusher.

## Endre reiseruten eller lugarer

Reiseruten ligger i Supabase-tabellen `itinerary_stops`. Den enkleste måten å
redigere er via **Table Editor** i Supabase-dashboardet. Sletting og oppdatering
av rader fungerer rett ut av boksen.

Lugarer ligger i `cabins`. Endre `name_no`, `capacity_max` eller
`description_no` etter behov.

## Bookinglogikk

- `start_date` og `end_date` er **begge inkludert** (første og siste natt ombord).
- En booking = én person. Lugarer har `capacity_max` (1 eller 2). Når noen
  prøver å booke en natt der lugaren er full, avvises bookingen.
- Alle med passordet kan slette hvilken som helst booking. Det er en bevisst
  forenkling for et lite vennegjeng-prosjekt.

## Stenge bookingen

Når turen er ferdig (eller du vil låse den): bytt `TRIP_PASSWORD` i Vercel og
redeploy. Da blir både innlogging og endringer låst ute, mens reiserute- og
båt-sidene fortsatt fungerer for nostalgi.

## Filstruktur

```
src/
  app/
    layout.tsx        – nav, root layout
    page.tsx          – forsiden
    reiserute/        – reiseruten (les fra Supabase)
    baten/            – båtinfo + lugaroversikt
    booking/          – passordgate, kalendergrid, booking-skjema
  lib/
    supabase.ts       – read- og write-klient
    auth.ts           – cookie-basert passordgate
    dates.ts          – ISO-dato-helpers, norsk format
    types.ts          – Cabin, ItineraryStop, Booking
supabase/
  migrations/         – kjør i Supabase SQL Editor
```

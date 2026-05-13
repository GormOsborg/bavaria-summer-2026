-- Add lat/lng to itinerary stops, populate, and lock the skipper's berth in the forward cabin.

alter table public.itinerary_stops
  add column if not exists lat double precision,
  add column if not exists lng double precision;

update public.itinerary_stops set lat = 59.8460, lng = 10.6710 where stop_date = '2026-06-28';
update public.itinerary_stops set lat = 59.6629, lng = 10.6283 where stop_date = '2026-06-29';
update public.itinerary_stops set lat = 59.1340, lng = 10.9650 where stop_date = '2026-06-30';
update public.itinerary_stops set lat = 59.0440, lng = 10.4180 where stop_date = '2026-07-01';
update public.itinerary_stops set lat = 58.9920, lng = 10.0410 where stop_date = '2026-07-02';
update public.itinerary_stops set lat = 58.9540, lng = 9.8800  where stop_date = '2026-07-03';
update public.itinerary_stops set lat = 58.8700, lng = 9.4130  where stop_date = '2026-07-04';
update public.itinerary_stops set lat = 58.7220, lng = 9.2360  where stop_date = '2026-07-05';
update public.itinerary_stops set lat = 58.6330, lng = 9.1370  where stop_date = '2026-07-06';
update public.itinerary_stops set lat = 58.2490, lng = 8.3760  where stop_date = '2026-07-07';
update public.itinerary_stops set lat = 58.4610, lng = 8.7700  where stop_date = '2026-07-08';
update public.itinerary_stops set lat = 58.8710, lng = 9.6120  where stop_date = '2026-07-09';
update public.itinerary_stops set lat = 58.9970, lng = 9.7440  where stop_date = '2026-07-10';
update public.itinerary_stops set lat = 59.0180, lng = 11.0240 where stop_date = '2026-07-11';
update public.itinerary_stops set lat = 58.8910, lng = 11.0000 where stop_date = '2026-07-12';
update public.itinerary_stops set lat = 58.9400, lng = 11.1790 where stop_date = '2026-07-13';
update public.itinerary_stops set lat = 58.6020, lng = 11.2860 where stop_date = '2026-07-14';
update public.itinerary_stops set lat = 58.9400, lng = 11.1790 where stop_date = '2026-07-15';

-- Skipperens faste plass i forlugaren hele reisen. Idempotent — kjør gjerne flere ganger.
insert into public.bookings (guest_name, cabin_id, start_date, end_date, notes)
select 'Skipper', 'forward', '2026-06-28', '2026-07-15', 'Skipper hele reisen'
where not exists (
  select 1 from public.bookings
  where guest_name = 'Skipper' and cabin_id = 'forward'
);

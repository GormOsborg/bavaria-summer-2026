-- Seed cabins and the rough itinerary for the 2026 trip.
-- Adjust freely once skipper has confirmed.

insert into public.cabins (id, name_no, capacity_max, description_no, position) values
  ('forward',       'Forlugar',        2, 'Stor dobbeltkøye foran. Behagelig for et par.', 1),
  ('aft_port',      'Akterlugar babord',   2, 'Akterlugar på babord side. Komfortabel for én, trang for to.', 2),
  ('aft_starboard', 'Akterlugar styrbord', 2, 'Akterlugar på styrbord side. Komfortabel for én, trang for to.', 3),
  ('salon',         'Salongsofaen',    2, 'Sofaen i salongen kan brukes som ekstra køyeplass.', 4);

-- Rough itinerary, Oksval → Lillesand → svenskekysten → Strømstad-området.
-- Editor: change freely. Dates correspond to the night spent at that stop.
insert into public.itinerary_stops (stop_date, location_no, type, notes_no, position) values
  ('2026-06-28', 'Oksval, Nesodden',          'harbor',    'Avreise. Provianter og pakker båten.',                          1),
  ('2026-06-29', 'Drøbak',                    'harbor',    'Kort etappe ut fjorden. Is i parken, kveldstur.',                2),
  ('2026-06-30', 'Hankø',                     'harbor',    'Klassisk Oslofjord-stopp. Gjestehavn eller naturhavn.',          3),
  ('2026-07-01', 'Tjøme / Verdens Ende',      'anchorage', 'Ankring i ly bak en holme. Bading.',                             4),
  ('2026-07-02', 'Stavern',                   'harbor',    'Sjarmerende sørlandsby. Restaurant på land.',                    5),
  ('2026-07-03', 'Nevlunghavn',               'anchorage', 'Ankring i Mølen-området hvis vær tillater.',                     6),
  ('2026-07-04', 'Kragerø',                   'harbor',    'Skjærgårdsperle. Lengre etappe — start tidlig.',                7),
  ('2026-07-05', 'Risør',                     'harbor',    'Hvite hus, trebåtfestivalstemning.',                             8),
  ('2026-07-06', 'Lyngør',                    'anchorage', 'Ankring i sundet. Stille kveld.',                                9),
  ('2026-07-07', 'Lillesand',                 'harbor',    'Snuvendepunkt. Bytte av mannskap mulig her.',                   10),
  ('2026-07-08', 'Arendal',                   'harbor',    'På vei tilbake. Pollen havn midt i sentrum.',                   11),
  ('2026-07-09', 'Jomfruland',                'anchorage', 'Lang etappe østover. Ankring på lesiden.',                      12),
  ('2026-07-10', 'Langesund / Jomfruland',    'anchorage', 'Reservebuffer ved dårlig vær.',                                 13),
  ('2026-07-11', 'Hvaler (Skjærhalden)',      'harbor',    'Krysser over mot svenskekysten. Skjærhalden gjestehavn.',       14),
  ('2026-07-12', 'Koster',                    'anchorage', 'Svensk skjærgård. Naturhavn ved Sydkoster eller Nordkoster.',   15),
  ('2026-07-13', 'Strömstad',                 'harbor',    'Svensk by med god gjestehavn.',                                 16),
  ('2026-07-14', 'Fjällbacka eller Grebbestad','harbor',   'Siste fullstendige seilingsdag før overlevering.',              17),
  ('2026-07-15', 'Strömstad (overlevering)',  'handover',  'Båten overleveres til bror. Tøm proviant, rydd.',               18);

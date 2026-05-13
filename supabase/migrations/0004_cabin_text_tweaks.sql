-- Mindre tekstendringer på lugarbeskrivelser og ett stopp.
-- Idempotent, kjør gjerne flere ganger.

update public.cabins
   set description_no = 'Stor dobbeltkøye foran. Behagelig for to.'
 where id = 'forward';

update public.cabins
   set description_no = 'Akterlugar på babord side. Komfortabel for én, litt trang for to.'
 where id = 'aft_port';

update public.cabins
   set description_no = 'Akterlugar på styrbord side. Komfortabel for én, litt trang for to.'
 where id = 'aft_starboard';

update public.itinerary_stops
   set notes_no = 'Skjærgårdsperle. Lengre etappe, start tidlig.'
 where stop_date = '2026-07-04';

-- Justert beskrivelse av akterlugarene.
-- Idempotent, kjør gjerne flere ganger.

update public.cabins
   set description_no = 'Akterlugar på babord side. Komfortabel for én. Går an å være to hvis man er et par.'
 where id = 'aft_port';

update public.cabins
   set description_no = 'Akterlugar på styrbord side. Komfortabel for én. Går an å være to hvis man er et par.'
 where id = 'aft_starboard';

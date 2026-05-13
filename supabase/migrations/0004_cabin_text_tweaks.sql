-- Mindre tekstendringer på lugarbeskrivelsene.
-- Idempotent — kjør gjerne flere ganger.

update public.cabins
   set description_no = 'Stor dobbeltkøye foran. Behagelig for to.'
 where id = 'forward';

update public.cabins
   set description_no = 'Akterlugar på babord side. Komfortabel for én, litt trang for to.'
 where id = 'aft_port';

update public.cabins
   set description_no = 'Akterlugar på styrbord side. Komfortabel for én, litt trang for to.'
 where id = 'aft_starboard';

import { supabaseRead } from "@/lib/supabase";
import type { Booking, Cabin, ItineraryStop } from "@/lib/types";
import BookingFlow from "./_components/booking-flow";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = supabaseRead();
  const [cabinsRes, stopsRes, bookingsRes] = await Promise.all([
    supabase.from("cabins").select("*").order("position", { ascending: true }),
    supabase
      .from("itinerary_stops")
      .select("*")
      .order("stop_date", { ascending: true }),
    supabase.from("bookings").select("*").order("start_date", { ascending: true }),
  ]);

  const cabins = (cabinsRes.data ?? []) as Cabin[];
  const stops = (stopsRes.data ?? []) as ItineraryStop[];
  const bookings = (bookingsRes.data ?? []) as Booking[];

  return (
    <div className="flex flex-col gap-10">
      <section>
        <p className="text-sm uppercase tracking-widest text-accent font-medium">
          28. juni – 15. juli 2026
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight">
          Sommertur med Bavaria 37
        </h1>
        <p className="mt-4 max-w-2xl text-foreground/80 leading-relaxed">
          Oksval → Lillesand → svenskekysten → Strömstad. Klikk en etappe på
          kartet, velg lugar på båten under, og bekreft. Passordet får du i
          gruppechatten.
        </p>
      </section>

      {cabins.length === 0 || stops.length === 0 ? (
        <div className="rounded-2xl bg-yellow-50 text-yellow-900 p-6 text-sm">
          Mangler data. Kjør SQL-migrasjonene i Supabase (
          <code>supabase/migrations/0001_init.sql</code>,{" "}
          <code>0002_seed.sql</code> og{" "}
          <code>0003_coords_and_skipper.sql</code>).
        </div>
      ) : (
        <BookingFlow cabins={cabins} stops={stops} bookings={bookings} />
      )}
    </div>
  );
}

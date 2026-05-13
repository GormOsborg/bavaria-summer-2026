import { isAuthenticated } from "@/lib/auth";
import { supabaseRead } from "@/lib/supabase";
import type { Booking, Cabin, ItineraryStop } from "@/lib/types";
import { eachNight, formatStayRange } from "@/lib/dates";
import LoginForm from "./login-form";
import BookingForm from "./booking-form";
import CalendarGrid from "./calendar-grid";
import DeleteButton from "./delete-button";
import { signOutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  if (!(await isAuthenticated())) {
    return <LoginForm />;
  }

  const supabase = supabaseRead();
  const [cabinsRes, stopsRes, bookingsRes] = await Promise.all([
    supabase.from("cabins").select("*").order("position", { ascending: true }),
    supabase.from("itinerary_stops").select("stop_date").order("stop_date", { ascending: true }),
    supabase.from("bookings").select("*").order("start_date", { ascending: true }),
  ]);

  const cabins = (cabinsRes.data ?? []) as Cabin[];
  const stops = (stopsRes.data ?? []) as Pick<ItineraryStop, "stop_date">[];
  const bookings = (bookingsRes.data ?? []) as Booking[];

  if (cabins.length === 0 || stops.length === 0) {
    return (
      <div className="rounded-2xl bg-yellow-50 text-yellow-900 p-6">
        Mangler data. Kjør SQL-migrasjonene i Supabase
        (<code>supabase/migrations/</code>) før du booker.
      </div>
    );
  }

  const minDate = stops[0].stop_date;
  const maxDate = stops[stops.length - 1].stop_date;
  const nights = eachNight(minDate, maxDate);

  const cabinName = new Map(cabins.map((c) => [c.id, c.name_no]));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Booking</h1>
          <p className="mt-2 text-foreground/70 max-w-2xl">
            Velg lugar og hvor mange netter du vil være med. Begge datoene er
            inkludert (siste natt er den siste du sover ombord).
          </p>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-xs text-foreground/60 hover:text-foreground underline underline-offset-2"
          >
            Logg ut
          </button>
        </form>
      </header>

      <section>
        <h2 className="text-lg font-semibold mb-2">Belegg per natt</h2>
        <CalendarGrid cabins={cabins} bookings={bookings} nights={nights} />
        <p className="mt-2 text-xs text-foreground/60">
          Tallene viser belegg/maks per natt. Hover over en celle for å se navn.
        </p>
      </section>

      <BookingForm cabins={cabins} minDate={minDate} maxDate={maxDate} />

      <section>
        <h2 className="text-lg font-semibold mb-3">Alle bookinger</h2>
        {bookings.length === 0 ? (
          <p className="text-foreground/60">Ingen bookinger enda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-background p-3"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{b.guest_name}</span>
                  <span className="text-xs text-foreground/60">
                    {cabinName.get(b.cabin_id) ?? b.cabin_id} ·{" "}
                    {formatStayRange(b.start_date, b.end_date)}
                  </span>
                  {b.notes && (
                    <span className="mt-1 text-xs text-foreground/70 italic">
                      {b.notes}
                    </span>
                  )}
                </div>
                <DeleteButton id={b.id} name={b.guest_name} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

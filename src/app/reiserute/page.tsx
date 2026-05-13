import { supabaseRead } from "@/lib/supabase";
import type { ItineraryStop } from "@/lib/types";
import { formatNorwegianDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<ItineraryStop["type"], string> = {
  harbor: "Havn",
  anchorage: "Naturhavn",
  sail: "Seiling",
  handover: "Overlevering",
};

const TYPE_COLOR: Record<ItineraryStop["type"], string> = {
  harbor: "bg-accent text-background",
  anchorage: "bg-sand text-foreground",
  sail: "bg-accent-soft text-foreground",
  handover: "bg-foreground text-background",
};

export default async function ReiserutePage() {
  const supabase = supabaseRead();
  const { data, error } = await supabase
    .from("itinerary_stops")
    .select("*")
    .order("stop_date", { ascending: true });

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 text-red-900 p-6">
        Klarte ikke å hente reiseruten: {error.message}
      </div>
    );
  }

  const stops = (data ?? []) as ItineraryStop[];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Reiserute</h1>
        <p className="mt-2 text-foreground/70 max-w-2xl">
          Dette er en skisse. Vær, vind og lyst styrer hva som faktisk skjer.
          Hver linje viser hvor vi planlegger å sove natten til den datoen.
        </p>
      </header>

      <ol className="flex flex-col gap-3">
        {stops.map((stop) => (
          <li
            key={stop.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 rounded-xl border border-foreground/10 bg-background p-4"
          >
            <div className="sm:w-40 shrink-0 text-sm font-medium text-foreground/70">
              {formatNorwegianDate(stop.stop_date)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-semibold">{stop.location_no}</span>
                <span
                  className={`inline-flex text-xs px-2 py-0.5 rounded-full ${TYPE_COLOR[stop.type]}`}
                >
                  {TYPE_LABEL[stop.type]}
                </span>
              </div>
              {stop.notes_no && (
                <p className="mt-1 text-sm text-foreground/70">{stop.notes_no}</p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {stops.length === 0 && (
        <p className="text-foreground/60">Reiseruten er ikke seedet enda.</p>
      )}
    </div>
  );
}

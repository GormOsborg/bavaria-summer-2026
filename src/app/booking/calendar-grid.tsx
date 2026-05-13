import type { Booking, Cabin } from "@/lib/types";
import { formatNorwegianDateShort } from "@/lib/dates";

type Props = {
  cabins: Cabin[];
  bookings: Booking[];
  nights: string[];
};

export default function CalendarGrid({ cabins, bookings, nights }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-foreground/10">
      <table className="min-w-full text-xs border-collapse">
        <thead className="bg-background sticky top-0">
          <tr>
            <th className="sticky left-0 bg-background text-left p-2 font-medium border-b border-foreground/10 z-10 min-w-32">
              Lugar
            </th>
            {nights.map((night) => (
              <th
                key={night}
                className="p-2 font-medium border-b border-foreground/10 text-center align-bottom whitespace-nowrap"
              >
                {formatNorwegianDateShort(night)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cabins.map((cabin) => (
            <tr key={cabin.id} className="border-t border-foreground/5">
              <th
                scope="row"
                className="sticky left-0 bg-background text-left p-2 font-medium border-r border-foreground/10 z-10"
              >
                <div>{cabin.name_no}</div>
                <div className="text-[10px] text-foreground/50 font-normal">
                  maks {cabin.capacity_max}
                </div>
              </th>
              {nights.map((night) => {
                const occupants = bookings.filter(
                  (b) =>
                    b.cabin_id === cabin.id &&
                    b.start_date <= night &&
                    b.end_date >= night,
                );
                const count = occupants.length;
                const isFull = count >= cabin.capacity_max;
                const bg = isFull
                  ? "bg-accent text-background"
                  : count > 0
                    ? "bg-accent-soft"
                    : "bg-background";
                return (
                  <td
                    key={night}
                    title={
                      occupants.length
                        ? occupants.map((o) => o.guest_name).join(", ")
                        : "Ledig"
                    }
                    className={`p-1 text-center align-middle border-l border-foreground/5 ${bg}`}
                  >
                    <div className="font-medium leading-none">
                      {count}/{cabin.capacity_max}
                    </div>
                    {occupants.length > 0 && (
                      <div className="mt-1 truncate max-w-20 text-[10px] leading-tight opacity-80">
                        {occupants.map((o) => o.guest_name.split(" ")[0]).join(", ")}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

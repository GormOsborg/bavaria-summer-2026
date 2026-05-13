import type { Booking, Cabin } from "./types";
import { SKIPPER_NAME } from "./types";
import { eachNight } from "./dates";

export type NightOccupancy = {
  date: string;
  total: number;
  guestTotal: number;
  perCabin: Record<string, { occupied: number; max: number; guests: number }>;
};

export function computeOccupancy(
  nights: string[],
  cabins: Cabin[],
  bookings: Booking[],
): Map<string, NightOccupancy> {
  const map = new Map<string, NightOccupancy>();
  for (const night of nights) {
    const perCabin: NightOccupancy["perCabin"] = {};
    let total = 0;
    let guestTotal = 0;
    for (const cabin of cabins) {
      const occupants = bookings.filter(
        (b) =>
          b.cabin_id === cabin.id && b.start_date <= night && b.end_date >= night,
      );
      const guests = occupants.filter((o) => o.guest_name !== SKIPPER_NAME).length;
      perCabin[cabin.id] = {
        occupied: occupants.length,
        max: cabin.capacity_max,
        guests,
      };
      total += occupants.length;
      guestTotal += guests;
    }
    map.set(night, { date: night, total, guestTotal, perCabin });
  }
  return map;
}

export function rangeNights(start: string, end: string): string[] {
  return eachNight(start, end);
}

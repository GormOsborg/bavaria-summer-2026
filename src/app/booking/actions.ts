"use server";

import { revalidatePath } from "next/cache";
import { supabaseRead, supabaseWrite } from "@/lib/supabase";
import { eachNight, parseISODate } from "@/lib/dates";
import { MAX_GUESTS_PER_NIGHT, SKIPPER_NAME } from "@/lib/types";

export type ActionState =
  | { ok: true; message?: string }
  | { ok: false; error: string };

function checkPassword(value: unknown): string | null {
  const expected = process.env.TRIP_PASSWORD;
  if (!expected) return "Server mangler TRIP_PASSWORD.";
  if (typeof value !== "string" || value !== expected) return "Feil passord.";
  return null;
}

function isValidISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseISODate(value).getTime());
}

export async function createBookingAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const pwError = checkPassword(formData.get("password"));
  if (pwError) return { ok: false, error: pwError };

  const guest_name = String(formData.get("guest_name") ?? "").trim();
  const cabin_id = String(formData.get("cabin_id") ?? "").trim();
  const start_date = String(formData.get("start_date") ?? "").trim();
  const end_date = String(formData.get("end_date") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw === "" ? null : notesRaw;

  if (!guest_name) return { ok: false, error: "Navn må fylles inn." };
  if (guest_name.toLowerCase() === SKIPPER_NAME.toLowerCase())
    return { ok: false, error: "Navnet «Skipper» er reservert." };
  if (!cabin_id) return { ok: false, error: "Velg en lugar." };
  if (!isValidISODate(start_date) || !isValidISODate(end_date)) {
    return { ok: false, error: "Datoene er ikke gyldige." };
  }
  if (start_date > end_date) {
    return { ok: false, error: "Første natt må være før eller lik siste natt." };
  }

  const read = supabaseRead();
  const { data: cabin, error: cabinError } = await read
    .from("cabins")
    .select("id, name_no, capacity_max")
    .eq("id", cabin_id)
    .single();
  if (cabinError || !cabin) {
    return { ok: false, error: "Fant ikke den lugaren." };
  }

  const nights = eachNight(start_date, end_date);

  const { data: cabinOverlap, error: cabinOverlapError } = await read
    .from("bookings")
    .select("id, start_date, end_date")
    .eq("cabin_id", cabin_id)
    .lte("start_date", end_date)
    .gte("end_date", start_date);
  if (cabinOverlapError) {
    return { ok: false, error: `Kunne ikke sjekke ledighet: ${cabinOverlapError.message}` };
  }
  for (const night of nights) {
    const occupied = (cabinOverlap ?? []).filter(
      (b) => b.start_date <= night && b.end_date >= night,
    ).length;
    if (occupied + 1 > cabin.capacity_max) {
      return {
        ok: false,
        error: `Lugaren er full natt til ${night}. Velg en annen lugar eller andre datoer.`,
      };
    }
  }

  const { data: nightOverlap, error: nightOverlapError } = await read
    .from("bookings")
    .select("id, start_date, end_date, guest_name")
    .lte("start_date", end_date)
    .gte("end_date", start_date);
  if (nightOverlapError) {
    return { ok: false, error: `Kunne ikke sjekke ledighet: ${nightOverlapError.message}` };
  }
  for (const night of nights) {
    const guestCount = (nightOverlap ?? []).filter(
      (b) => b.start_date <= night && b.end_date >= night && b.guest_name !== SKIPPER_NAME,
    ).length;
    if (guestCount + 1 > MAX_GUESTS_PER_NIGHT) {
      return {
        ok: false,
        error: `Båten er full (maks ${MAX_GUESTS_PER_NIGHT} gjester) natt til ${night}.`,
      };
    }
  }

  const write = supabaseWrite();
  const { error: insertError } = await write.from("bookings").insert({
    guest_name,
    cabin_id,
    start_date,
    end_date,
    notes,
  });
  if (insertError) {
    return { ok: false, error: `Kunne ikke lagre bookingen: ${insertError.message}` };
  }

  revalidatePath("/");
  revalidatePath("/booking");
  return { ok: true, message: `Booket ${cabin.name_no} for ${guest_name}.` };
}

export async function deleteBookingAction(formData: FormData): Promise<void> {
  const pwError = checkPassword(formData.get("password"));
  if (pwError) throw new Error(pwError);
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Mangler ID.");

  const read = supabaseRead();
  const { data: target } = await read
    .from("bookings")
    .select("guest_name")
    .eq("id", id)
    .single();
  if (target?.guest_name === SKIPPER_NAME) {
    throw new Error("Skipper-bookingen kan ikke slettes herfra.");
  }

  const write = supabaseWrite();
  const { error } = await write.from("bookings").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/booking");
}

"use server";

import { revalidatePath } from "next/cache";
import { isAuthenticated, signIn, signOut } from "@/lib/auth";
import { supabaseRead, supabaseWrite } from "@/lib/supabase";
import { eachNight, parseISODate } from "@/lib/dates";

export type ActionState =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export async function signInAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const success = await signIn(password);
  if (!success) {
    return { ok: false, error: "Feil passord." };
  }
  revalidatePath("/booking");
  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  await signOut();
  revalidatePath("/booking");
}

function isValidISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseISODate(value).getTime());
}

export async function createBookingAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  if (!(await isAuthenticated())) {
    return { ok: false, error: "Du må logge inn med passord først." };
  }

  const guest_name = String(formData.get("guest_name") ?? "").trim();
  const cabin_id = String(formData.get("cabin_id") ?? "").trim();
  const start_date = String(formData.get("start_date") ?? "").trim();
  const end_date = String(formData.get("end_date") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw === "" ? null : notesRaw;

  if (!guest_name) return { ok: false, error: "Navn må fylles inn." };
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

  const { data: overlapping, error: overlapError } = await read
    .from("bookings")
    .select("id, start_date, end_date")
    .eq("cabin_id", cabin_id)
    .lte("start_date", end_date)
    .gte("end_date", start_date);
  if (overlapError) {
    return { ok: false, error: `Kunne ikke sjekke ledighet: ${overlapError.message}` };
  }

  const nights = eachNight(start_date, end_date);
  for (const night of nights) {
    const occupied = (overlapping ?? []).filter(
      (b) => b.start_date <= night && b.end_date >= night,
    ).length;
    if (occupied + 1 > cabin.capacity_max) {
      return {
        ok: false,
        error: `Lugaren er full natt til ${night}. Velg en annen lugar eller andre datoer.`,
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

  revalidatePath("/booking");
  return { ok: true, message: `Booket ${cabin.name_no} for ${guest_name}.` };
}

export async function deleteBookingAction(formData: FormData): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Ikke autorisert.");
  }
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Mangler ID.");

  const write = supabaseWrite();
  const { error } = await write.from("bookings").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/booking");
}

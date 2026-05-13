"use client";

import { useActionState, useRef, useEffect } from "react";
import type { Cabin } from "@/lib/types";
import { createBookingAction, type ActionState } from "./actions";

type Props = {
  cabins: Cabin[];
  minDate: string;
  maxDate: string;
};

export default function BookingForm({ cabins, minDate, maxDate }: Props) {
  const [state, formAction, pending] = useActionState<ActionState | undefined, FormData>(
    createBookingAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-foreground/10 bg-background p-6 grid sm:grid-cols-2 gap-4"
    >
      <h2 className="sm:col-span-2 text-xl font-semibold">Ny booking</h2>

      <label className="flex flex-col gap-1 text-sm">
        Navn
        <input
          name="guest_name"
          required
          maxLength={60}
          className="rounded-lg border border-foreground/15 bg-background px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Lugar
        <select
          name="cabin_id"
          required
          defaultValue=""
          className="rounded-lg border border-foreground/15 bg-background px-3 py-2"
        >
          <option value="" disabled>
            Velg lugar…
          </option>
          {cabins.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_no} (maks {c.capacity_max})
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Første natt ombord
        <input
          type="date"
          name="start_date"
          required
          min={minDate}
          max={maxDate}
          className="rounded-lg border border-foreground/15 bg-background px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Siste natt ombord
        <input
          type="date"
          name="end_date"
          required
          min={minDate}
          max={maxDate}
          className="rounded-lg border border-foreground/15 bg-background px-3 py-2"
        />
      </label>

      <label className="sm:col-span-2 flex flex-col gap-1 text-sm">
        Notat (valgfritt)
        <textarea
          name="notes"
          rows={2}
          maxLength={200}
          placeholder="F.eks. allergier, ankomsttid…"
          className="rounded-lg border border-foreground/15 bg-background px-3 py-2"
        />
      </label>

      <div className="sm:col-span-2 flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent text-background px-4 py-2 font-medium disabled:opacity-60"
        >
          {pending ? "Lagrer…" : "Bestill"}
        </button>
        {state?.ok && state.message && (
          <span className="text-sm text-emerald-700">{state.message}</span>
        )}
        {state && !state.ok && (
          <span className="text-sm text-red-700">{state.error}</span>
        )}
      </div>
    </form>
  );
}

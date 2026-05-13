"use client";

import { useActionState, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Booking, Cabin, ItineraryStop } from "@/lib/types";
import { MAX_GUESTS_PER_NIGHT, SKIPPER_NAME } from "@/lib/types";
import { computeOccupancy } from "@/lib/occupancy";
import { eachNight, formatNorwegianDate, formatStayRange } from "@/lib/dates";
import { createBookingAction, deleteBookingAction, type ActionState } from "@/app/booking/actions";
import BoatSvg from "./boat-svg";

const RouteMap = dynamic(() => import("./route-map"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-foreground/10 h-[420px] sm:h-[520px] flex items-center justify-center text-foreground/40">
      Laster kart…
    </div>
  ),
});

type Props = {
  cabins: Cabin[];
  stops: ItineraryStop[];
  bookings: Booking[];
};

type Range = { start: string; end: string };

export default function BookingFlow({ cabins, stops, bookings }: Props) {
  const allNights = useMemo(() => stops.map((s) => s.stop_date), [stops]);
  const occupancy = useMemo(
    () => computeOccupancy(allNights, cabins, bookings),
    [allNights, cabins, bookings],
  );

  const [range, setRange] = useState<Range | null>(null);
  const [selectedCabin, setSelectedCabin] = useState<string | null>(null);

  const selectedDates = useMemo(
    () => (range ? eachNight(range.start, range.end) : []),
    [range],
  );
  const selectedDateSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  function extendRange(date: string) {
    if (!range) {
      setRange({ start: date, end: date });
      return;
    }
    if (date < range.start) {
      setRange({ start: date, end: range.end });
      return;
    }
    if (date > range.end) {
      setRange({ start: range.start, end: date });
      return;
    }
  }

  function setStart(date: string) {
    if (!range) {
      setRange({ start: date, end: date });
      return;
    }
    setRange({ start: date, end: date > range.end ? date : range.end });
  }

  function setEnd(date: string) {
    if (!range) {
      setRange({ start: date, end: date });
      return;
    }
    setRange({ start: date < range.start ? date : range.start, end: date });
  }

  function clearSelection() {
    setRange(null);
    setSelectedCabin(null);
  }

  function selectWholeTrip() {
    if (allNights.length === 0) return;
    setRange({ start: allNights[0], end: allNights[allNights.length - 1] });
  }

  const [state, formAction, pending] = useActionState<ActionState | undefined, FormData>(
    async (prev, formData) => {
      const result = await createBookingAction(prev, formData);
      if (result.ok) {
        clearSelection();
      }
      return result;
    },
    undefined,
  );

  const minDate = allNights[0] ?? "";
  const maxDate = allNights[allNights.length - 1] ?? "";

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-semibold">Velg etapper</h2>
          <div className="flex items-center gap-3 text-xs">
            <LegendDot color="#16a34a" label="ledig" />
            <LegendDot color="#ea580c" label="delvis" />
            <LegendDot color="#dc2626" label={`fullt (${MAX_GUESTS_PER_NIGHT})`} />
          </div>
        </header>
        <RouteMap
          stops={stops}
          occupancy={occupancy}
          selectedDates={selectedDateSet}
          onSelectDate={extendRange}
        />
        <RangePicker
          stops={stops}
          range={range}
          onSetStart={setStart}
          onSetEnd={setEnd}
          onClear={clearSelection}
          onSelectWholeTrip={selectWholeTrip}
        />
      </section>

      <section className="rounded-2xl border border-foreground/10 bg-background p-5 sm:p-6">
        <BoatSvg
          cabins={cabins}
          selectedDates={selectedDates}
          occupancy={occupancy}
          selectedCabin={selectedCabin}
          onSelectCabin={setSelectedCabin}
        />
      </section>

      <section>
        <form
          action={formAction}
          className="rounded-2xl border border-foreground/10 bg-background p-5 sm:p-6 flex flex-col gap-4"
        >
          <h2 className="text-xl font-semibold">Bekreft booking</h2>

          <input type="hidden" name="cabin_id" value={selectedCabin ?? ""} />
          <input type="hidden" name="start_date" value={range?.start ?? ""} />
          <input type="hidden" name="end_date" value={range?.end ?? ""} />

          <ConfirmRow
            label="Etappe"
            value={
              range
                ? range.start === range.end
                  ? formatNorwegianDate(range.start)
                  : `${formatNorwegianDate(range.start)} – ${formatNorwegianDate(range.end)}`
                : "ingen valgt"
            }
            missing={!range}
          />
          <ConfirmRow
            label="Lugar"
            value={
              selectedCabin
                ? cabins.find((c) => c.id === selectedCabin)?.name_no ?? selectedCabin
                : "ingen valgt"
            }
            missing={!selectedCabin}
          />

          <div className="grid sm:grid-cols-2 gap-3">
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
              Passord
              <input
                name="password"
                type="password"
                required
                autoComplete="off"
                className="rounded-lg border border-foreground/15 bg-background px-3 py-2"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            Notat (valgfritt)
            <textarea
              name="notes"
              rows={2}
              maxLength={200}
              placeholder="F.eks. allergier eller ankomsttid"
              className="rounded-lg border border-foreground/15 bg-background px-3 py-2"
            />
          </label>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="submit"
              disabled={pending || !range || !selectedCabin}
              className="rounded-lg bg-accent text-background px-5 py-2 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {pending ? "Lagrer…" : "Bekreft booking"}
            </button>
            {state?.ok && state.message && (
              <span className="text-sm text-emerald-700">{state.message}</span>
            )}
            {state && !state.ok && (
              <span className="text-sm text-red-700">{state.error}</span>
            )}
          </div>

          {!range && (
            <p className="text-xs text-foreground/60">
              Klikk en etappe på kartet, eller velg datoer fra dropdownene.
            </p>
          )}
          {!selectedCabin && range && (
            <p className="text-xs text-foreground/60">
              Klikk en lugar på båten over for å velge soveplass.
            </p>
          )}

          <input type="hidden" name="min_date" value={minDate} />
          <input type="hidden" name="max_date" value={maxDate} />
        </form>
      </section>

      <BookingList bookings={bookings} cabins={cabins} />
    </div>
  );
}

function RangePicker({
  stops,
  range,
  onSetStart,
  onSetEnd,
  onClear,
  onSelectWholeTrip,
}: {
  stops: ItineraryStop[];
  range: Range | null;
  onSetStart: (date: string) => void;
  onSetEnd: (date: string) => void;
  onClear: () => void;
  onSelectWholeTrip: () => void;
}) {
  const totalNights = range ? eachNight(range.start, range.end).length : 0;
  return (
    <div className="rounded-2xl border border-foreground/10 bg-accent-soft px-4 py-3 flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-foreground/80">
          Fra
          <select
            value={range?.start ?? ""}
            onChange={(e) => onSetStart(e.target.value)}
            className="rounded-lg border border-foreground/15 bg-background px-3 py-1.5 text-sm min-w-44"
          >
            <option value="" disabled>
              velg første natt
            </option>
            {stops.map((s) => (
              <option key={`from-${s.id}`} value={s.stop_date}>
                {formatNorwegianDate(s.stop_date)} – {s.location_no}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-foreground/80">
          Til
          <select
            value={range?.end ?? ""}
            onChange={(e) => onSetEnd(e.target.value)}
            className="rounded-lg border border-foreground/15 bg-background px-3 py-1.5 text-sm min-w-44"
          >
            <option value="" disabled>
              velg siste natt
            </option>
            {stops.map((s) => (
              <option key={`to-${s.id}`} value={s.stop_date}>
                {formatNorwegianDate(s.stop_date)} – {s.location_no}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            onClick={onSelectWholeTrip}
            className="text-xs rounded-lg border border-foreground/15 bg-background px-3 py-1.5 hover:border-foreground/40"
          >
            Hele turen
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-xs rounded-lg border border-foreground/15 bg-background px-3 py-1.5 hover:border-foreground/40"
            disabled={!range}
          >
            Nullstill
          </button>
        </div>
      </div>
      <p className="text-xs text-foreground/70">
        {range
          ? totalNights === 1
            ? `1 natt valgt`
            : `${totalNights} netter valgt`
          : "Ingenting valgt enda. Klikk en etappe på kartet, eller velg fra dropdownene."}
      </p>
    </div>
  );
}

function ConfirmRow({ label, value, missing }: { label: string; value: string; missing: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm border-b border-foreground/5 pb-2">
      <span className="text-foreground/60">{label}</span>
      <span className={missing ? "text-foreground/40 italic" : "font-medium"}>{value}</span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function BookingList({ bookings, cabins }: { bookings: Booking[]; cabins: Cabin[] }) {
  const cabinName = useMemo(() => new Map(cabins.map((c) => [c.id, c.name_no])), [cabins]);
  if (bookings.length === 0) return null;
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">Alle bookinger</h2>
      <ul className="flex flex-col gap-2">
        {bookings.map((b) => {
          const isSkipper = b.guest_name === SKIPPER_NAME;
          return (
            <li
              key={b.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-foreground/10 bg-background p-3"
            >
              <div className="flex flex-col">
                <span className="font-medium">
                  {b.guest_name}
                  {isSkipper && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-foreground text-background">
                      skipper
                    </span>
                  )}
                </span>
                <span className="text-xs text-foreground/60">
                  {cabinName.get(b.cabin_id) ?? b.cabin_id} ·{" "}
                  {formatStayRange(b.start_date, b.end_date)}
                </span>
                {b.notes && (
                  <span className="mt-1 text-xs text-foreground/70 italic">{b.notes}</span>
                )}
              </div>
              {!isSkipper && <DeleteBookingForm id={b.id} name={b.guest_name} />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function DeleteBookingForm({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteBookingAction}
      onSubmit={(e) => {
        const pw = prompt(`Skriv inn passordet for å slette bookingen til ${name}:`);
        if (!pw) {
          e.preventDefault();
          return;
        }
        const input = e.currentTarget.querySelector<HTMLInputElement>('input[name="password"]');
        if (input) input.value = pw;
      }}
      className="flex"
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="password" value="" />
      <button
        type="submit"
        className="text-xs text-foreground/60 hover:text-red-700 underline underline-offset-2"
      >
        Slett
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import type { Cabin } from "@/lib/types";
import type { NightOccupancy } from "@/lib/occupancy";

type Props = {
  cabins: Cabin[];
  selectedDates: string[];
  allDates: string[];
  occupancy: Map<string, NightOccupancy>;
  selectedCabin: string | null;
  onSelectCabin: (cabinId: string) => void;
};

const CABIN_GEOMETRY: Record<string, { points: string; labelX: number; labelY: number }> = {
  forward: {
    points: "100,38 70,80 50,150 70,210 130,210 150,150 130,80",
    labelX: 100,
    labelY: 130,
  },
  salon: {
    points: "45,260 155,260 155,395 45,395",
    labelX: 100,
    labelY: 330,
  },
  aft_port: {
    points: "45,430 95,430 95,570 60,570 45,560",
    labelX: 70,
    labelY: 500,
  },
  aft_starboard: {
    points: "105,430 155,430 155,560 140,570 105,570",
    labelX: 130,
    labelY: 500,
  },
};

function stateForCabin(
  cabin: Cabin,
  dates: string[],
  occupancy: Map<string, NightOccupancy>,
): "empty" | "partial" | "full" {
  if (dates.length === 0) {
    return cabin.id === "forward" ? "partial" : "empty";
  }
  let anyFull = false;
  let anyFree = false;
  let anyOccupant = false;
  for (const date of dates) {
    const info = occupancy.get(date)?.perCabin[cabin.id];
    if (!info) {
      anyFree = true;
      continue;
    }
    if (info.occupied > 0) anyOccupant = true;
    if (info.occupied >= info.max) anyFull = true;
    else anyFree = true;
  }
  if (cabin.id === "forward" && !anyFull) return "partial";
  if (anyFull && anyFree) return "partial";
  if (anyFull) return "full";
  if (anyOccupant) return "partial";
  return "empty";
}

const STATE_FILL: Record<"empty" | "partial" | "full", string> = {
  empty: "#bbf7d0",
  partial: "#fef08a",
  full: "#fecaca",
};

const STATE_STROKE: Record<"empty" | "partial" | "full", string> = {
  empty: "#16a34a",
  partial: "#ca8a04",
  full: "#dc2626",
};

const STATE_LABEL: Record<"empty" | "partial" | "full", string> = {
  empty: "ledig",
  partial: "delvis",
  full: "fullt",
};

export default function BoatSvg({
  cabins,
  selectedDates,
  allDates,
  occupancy,
  selectedCabin,
  onSelectCabin,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const infoCabinId = hovered ?? selectedCabin;
  const infoCabin = infoCabinId ? cabins.find((c) => c.id === infoCabinId) : null;
  const datesForState = selectedDates.length > 0 ? selectedDates : allDates;
  const isShowingTripWide = selectedDates.length === 0;

  return (
    <div className="grid lg:grid-cols-[auto_1fr_18rem] gap-6 items-start">
      <svg
        viewBox="0 0 200 640"
        className="max-h-[640px] w-44 sm:w-52 shrink-0 mx-auto lg:mx-0"
        role="img"
        aria-label="Bavaria 37 sett ovenfra"
      >
        <path
          d="M 100,5
             C 65,30 35,110 32,210
             L 32,540
             C 32,575 50,600 70,605
             L 130,605
             C 150,600 168,575 168,540
             L 168,210
             C 165,110 135,30 100,5
             Z"
          fill="#f7f3ec"
          stroke="#11283d"
          strokeWidth="2.5"
        />
        <path
          d="M 100,30
             C 75,55 50,130 48,220
             L 48,425
             C 48,445 58,455 75,455
             L 125,455
             C 142,455 152,445 152,425
             L 152,220
             C 150,130 125,55 100,30
             Z"
          fill="none"
          stroke="#11283d"
          strokeOpacity="0.18"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <circle cx="100" cy="240" r="4" fill="#11283d" />
        {cabins.map((cabin) => {
          const geo = CABIN_GEOMETRY[cabin.id];
          if (!geo) return null;
          const state = stateForCabin(cabin, datesForState, occupancy);
          const isSelected = selectedCabin === cabin.id;
          const isHovered = hovered === cabin.id;
          return (
            <g
              key={cabin.id}
              onClick={() => onSelectCabin(cabin.id)}
              onMouseEnter={() => setHovered(cabin.id)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <polygon
                points={geo.points}
                fill={STATE_FILL[state]}
                stroke={STATE_STROKE[state]}
                strokeWidth={isSelected ? 4 : isHovered ? 2.5 : 1.5}
                opacity={isSelected || isHovered ? 1 : 0.9}
              />
              <text
                x={geo.labelX}
                y={geo.labelY}
                textAnchor="middle"
                fontSize="9"
                fill="#11283d"
                style={{ pointerEvents: "none" }}
              >
                {cabin.name_no.replace("Akterlugar ", "")}
              </text>
            </g>
          );
        })}
        <rect
          x="60"
          y="495"
          width="80"
          height="60"
          fill="none"
          stroke="#11283d"
          strokeOpacity="0.15"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <text
          x="100"
          y="530"
          textAnchor="middle"
          fontSize="8"
          fill="#11283d"
          opacity="0.4"
        >
          cockpit
        </text>
      </svg>

      <div className="min-w-0">
        <h3 className="font-semibold text-lg">Velg lugar</h3>
        {isShowingTripWide ? (
          <p className="mt-2 text-sm text-foreground/60">
            Viser belegg på tvers av hele turen. Klikk en etappe på kartet for å
            se belegget for bestemte netter.
          </p>
        ) : (
          <p className="mt-2 text-sm text-foreground/70">
            Belegg for de {selectedDates.length} valgte nettene. Klikk en lugar
            for å velge den. Hold musen over for å lese mer.
          </p>
        )}
        <ul className="mt-4 space-y-2">
          {cabins.map((cabin) => {
            const state = stateForCabin(cabin, datesForState, occupancy);
            const isSelected = selectedCabin === cabin.id;
            return (
              <li key={cabin.id}>
                <button
                  type="button"
                  onClick={() => onSelectCabin(cabin.id)}
                  onMouseEnter={() => setHovered(cabin.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(cabin.id)}
                  onBlur={() => setHovered(null)}
                  className={`w-full text-left rounded-lg border px-3 py-2 transition ${
                    isSelected
                      ? "border-accent bg-accent text-background"
                      : "border-foreground/10 hover:border-foreground/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-sm flex items-center gap-2">
                      {cabin.name_no}
                      <span
                        className={`text-[10px] w-4 h-4 inline-flex items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-background/40 text-background/80"
                            : "border-foreground/30 text-foreground/50"
                        }`}
                        aria-hidden
                      >
                        ?
                      </span>
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: STATE_FILL[state],
                        color: STATE_STROKE[state],
                      }}
                    >
                      {STATE_LABEL[state]}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex gap-3 text-xs text-foreground/70 flex-wrap">
          <Legend color={STATE_FILL.empty} stroke={STATE_STROKE.empty} label="ledig" />
          <Legend color={STATE_FILL.partial} stroke={STATE_STROKE.partial} label="delvis" />
          <Legend color={STATE_FILL.full} stroke={STATE_STROKE.full} label="fullt" />
        </div>
      </div>

      <aside
        aria-live="polite"
        className="rounded-xl border border-foreground/10 bg-accent-soft p-4 text-sm min-h-32"
      >
        {infoCabin ? (
          <>
            <h4 className="font-semibold">{infoCabin.name_no}</h4>
            <p className="mt-2 text-foreground/80 leading-relaxed">
              {infoCabin.description_no ?? "Ingen beskrivelse i databasen enda."}
            </p>
            {infoCabin.id === "forward" && (
              <p className="mt-2 text-xs text-foreground/60">
                Skipper okkuperer 1 av 2 plasser her hele turen.
              </p>
            )}
          </>
        ) : (
          <p className="text-foreground/60">
            Hold musen over en lugar, eller trykk på den, for å lese mer.
          </p>
        )}
      </aside>
    </div>
  );
}

function Legend({ color, stroke, label }: { color: string; stroke: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-3 h-3 rounded-sm border"
        style={{ backgroundColor: color, borderColor: stroke }}
      />
      {label}
    </span>
  );
}

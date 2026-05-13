"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { ItineraryStop } from "@/lib/types";
import type { NightOccupancy } from "@/lib/occupancy";
import { MAX_GUESTS_PER_NIGHT } from "@/lib/types";
import { formatNorwegianDate } from "@/lib/dates";

type Props = {
  stops: ItineraryStop[];
  occupancy: Map<string, NightOccupancy>;
  selectedDates: Set<string>;
  onToggleDate: (date: string) => void;
};

function colorForGuests(guests: number): string {
  if (guests <= 0) return "#16a34a";
  if (guests >= MAX_GUESTS_PER_NIGHT) return "#dc2626";
  return "#ea580c";
}

function FitBounds({ stops }: { stops: ItineraryStop[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = stops
      .filter((s): s is ItineraryStop & { lat: number; lng: number } => s.lat != null && s.lng != null)
      .map((s) => [s.lat, s.lng] as [number, number]);
    if (pts.length >= 2) {
      map.fitBounds(pts, { padding: [30, 30] });
    }
  }, [map, stops]);
  return null;
}

export default function RouteMap({ stops, occupancy, selectedDates, onToggleDate }: Props) {
  const geoStops = useMemo(
    () =>
      stops.filter(
        (s): s is ItineraryStop & { lat: number; lng: number } =>
          s.lat != null && s.lng != null,
      ),
    [stops],
  );

  if (geoStops.length === 0) {
    return (
      <div className="rounded-2xl bg-yellow-50 text-yellow-900 p-6 text-sm">
        Stoppene mangler koordinater. Kjør{" "}
        <code>supabase/migrations/0003_coords_and_skipper.sql</code> i Supabase
        SQL Editor.
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-foreground/10 h-[420px] sm:h-[520px]">
      <MapContainer
        center={[geoStops[0].lat, geoStops[0].lng]}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds stops={geoStops} />
        {geoStops.slice(0, -1).map((stop, i) => {
          const next = geoStops[i + 1];
          const occNext = occupancy.get(next.stop_date);
          const guests = occNext?.guestTotal ?? 0;
          const color = colorForGuests(guests);
          const legSelected =
            selectedDates.has(stop.stop_date) && selectedDates.has(next.stop_date);
          return (
            <Polyline
              key={`${stop.id}-${next.id}`}
              positions={[
                [stop.lat, stop.lng],
                [next.lat, next.lng],
              ]}
              pathOptions={{
                color,
                weight: legSelected ? 7 : 4,
                opacity: legSelected ? 1 : 0.85,
                dashArray: legSelected ? undefined : "0",
              }}
              eventHandlers={{
                click: () => onToggleDate(next.stop_date),
              }}
            >
              <Tooltip sticky>
                <strong>
                  {stop.location_no} → {next.location_no}
                </strong>
                <br />
                Natt til {formatNorwegianDate(next.stop_date)}: {guests}/
                {MAX_GUESTS_PER_NIGHT} gjester
              </Tooltip>
            </Polyline>
          );
        })}
        {geoStops.map((stop) => {
          const occ = occupancy.get(stop.stop_date);
          const guests = occ?.guestTotal ?? 0;
          const color = colorForGuests(guests);
          const isSelected = selectedDates.has(stop.stop_date);
          return (
            <CircleMarker
              key={stop.id}
              center={[stop.lat, stop.lng]}
              radius={isSelected ? 11 : 7}
              pathOptions={{
                color: "#11283d",
                fillColor: color,
                fillOpacity: 1,
                weight: isSelected ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => onToggleDate(stop.stop_date),
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <strong>{stop.location_no}</strong>
                <br />
                {formatNorwegianDate(stop.stop_date)}
                <br />
                {guests}/{MAX_GUESTS_PER_NIGHT} gjester
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

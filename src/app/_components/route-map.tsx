"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { ItineraryStop } from "@/lib/types";
import type { NightOccupancy } from "@/lib/occupancy";
import { MAX_GUESTS_PER_NIGHT } from "@/lib/types";
import { formatNorwegianDate } from "@/lib/dates";

type Props = {
  stops: ItineraryStop[];
  occupancy: Map<string, NightOccupancy>;
  selectedDates: Set<string>;
  onSelectDate: (date: string) => void;
};

const OFFSET_DEG = 0.025;

function colorForGuests(guests: number): string {
  if (guests <= 0) return "#16a34a";
  if (guests >= MAX_GUESTS_PER_NIGHT) return "#dc2626";
  return "#ea580c";
}

type LatLng = { lat: number; lng: number };

function offsetLeg(
  a: LatLng,
  b: LatLng,
  magnitude: number,
): { a: LatLng; b: LatLng; mid: LatLng; rotation: number } {
  const dLng = b.lng - a.lng;
  const dLat = b.lat - a.lat;
  const len = Math.sqrt(dLng * dLng + dLat * dLat);
  if (len === 0) {
    return { a, b, mid: a, rotation: 0 };
  }
  const offLat = -(dLng / len) * magnitude;
  const offLng = (dLat / len) * magnitude;
  const oa = { lat: a.lat + offLat, lng: a.lng + offLng };
  const ob = { lat: b.lat + offLat, lng: b.lng + offLng };
  const mid = { lat: (oa.lat + ob.lat) / 2, lng: (oa.lng + ob.lng) / 2 };
  const rotation = -Math.atan2(dLat, dLng) * (180 / Math.PI);
  return { a: oa, b: ob, mid, rotation };
}

function arrowIcon(rotation: number, color: string, highlighted: boolean): L.DivIcon {
  const size = highlighted ? 22 : 16;
  return L.divIcon({
    className: "leaflet-arrow-icon",
    html: `<div style="transform: rotate(${rotation}deg); width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center;">
      <svg viewBox="-10 -10 20 20" width="${size}" height="${size}" style="overflow:visible">
        <polygon points="-6,-5 6,0 -6,5 -3,0" fill="${color}" stroke="white" stroke-width="1.2" stroke-linejoin="round" />
      </svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitBounds({ stops }: { stops: ItineraryStop[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = stops
      .filter(
        (s): s is ItineraryStop & { lat: number; lng: number } =>
          s.lat != null && s.lng != null,
      )
      .map((s) => [s.lat, s.lng] as [number, number]);
    if (pts.length >= 2) {
      map.fitBounds(pts, { padding: [40, 40] });
    }
  }, [map, stops]);
  return null;
}

export default function RouteMap({ stops, occupancy, selectedDates, onSelectDate }: Props) {
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
          const offset = offsetLeg(stop, next, OFFSET_DEG);
          const legSelected =
            selectedDates.has(stop.stop_date) && selectedDates.has(next.stop_date);
          return (
            <Polyline
              key={`${stop.id}-${next.id}`}
              positions={[
                [offset.a.lat, offset.a.lng],
                [offset.b.lat, offset.b.lng],
              ]}
              pathOptions={{
                color,
                weight: legSelected ? 7 : 4,
                opacity: legSelected ? 1 : 0.85,
              }}
              eventHandlers={{
                click: () => onSelectDate(next.stop_date),
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

        {geoStops.slice(0, -1).map((stop, i) => {
          const next = geoStops[i + 1];
          const occNext = occupancy.get(next.stop_date);
          const guests = occNext?.guestTotal ?? 0;
          const color = colorForGuests(guests);
          const offset = offsetLeg(stop, next, OFFSET_DEG);
          const legSelected =
            selectedDates.has(stop.stop_date) && selectedDates.has(next.stop_date);
          return (
            <Marker
              key={`arrow-${stop.id}-${next.id}`}
              position={[offset.mid.lat, offset.mid.lng]}
              icon={arrowIcon(offset.rotation, color, legSelected)}
              interactive
              eventHandlers={{
                click: () => onSelectDate(next.stop_date),
              }}
            />
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
                click: () => onSelectDate(stop.stop_date),
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

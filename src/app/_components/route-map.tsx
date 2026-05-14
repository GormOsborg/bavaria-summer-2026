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

const CURVE_OFFSET_DEG = 0.05;
const CURVE_SAMPLES = 18;

function colorForGuests(guests: number): string {
  if (guests <= 0) return "#16a34a";
  if (guests >= MAX_GUESTS_PER_NIGHT) return "#dc2626";
  return "#ca8a04";
}

type LatLng = { lat: number; lng: number };

function curveLeg(
  a: LatLng,
  b: LatLng,
  magnitude: number,
  samples: number,
): { positions: Array<[number, number]>; mid: LatLng; rotation: number } {
  const dLng = b.lng - a.lng;
  const dLat = b.lat - a.lat;
  const len = Math.sqrt(dLng * dLng + dLat * dLat);
  if (len === 0) {
    return { positions: [[a.lat, a.lng]], mid: a, rotation: 0 };
  }
  const perpLat = -(dLng / len) * magnitude;
  const perpLng = (dLat / len) * magnitude;
  const midAB = { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
  // Bezier control point chosen so the curve at t=0.5 is offset by `magnitude` from midAB.
  const ctrl = {
    lat: midAB.lat + 2 * perpLat,
    lng: midAB.lng + 2 * perpLng,
  };

  const positions: Array<[number, number]> = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const omt = 1 - t;
    const lat = omt * omt * a.lat + 2 * omt * t * ctrl.lat + t * t * b.lat;
    const lng = omt * omt * a.lng + 2 * omt * t * ctrl.lng + t * t * b.lng;
    positions.push([lat, lng]);
  }

  const mid = {
    lat: 0.25 * a.lat + 0.5 * ctrl.lat + 0.25 * b.lat,
    lng: 0.25 * a.lng + 0.5 * ctrl.lng + 0.25 * b.lng,
  };
  const rotation = -Math.atan2(dLat, dLng) * (180 / Math.PI);
  return { positions, mid, rotation };
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
          const curve = curveLeg(stop, next, CURVE_OFFSET_DEG, CURVE_SAMPLES);
          const legSelected =
            selectedDates.has(stop.stop_date) && selectedDates.has(next.stop_date);
          return (
            <Polyline
              key={`${stop.id}-${next.id}`}
              positions={curve.positions}
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
          const curve = curveLeg(stop, next, CURVE_OFFSET_DEG, CURVE_SAMPLES);
          const legSelected =
            selectedDates.has(stop.stop_date) && selectedDates.has(next.stop_date);
          return (
            <Marker
              key={`arrow-${stop.id}-${next.id}`}
              position={[curve.mid.lat, curve.mid.lng]}
              icon={arrowIcon(curve.rotation, color, legSelected)}
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

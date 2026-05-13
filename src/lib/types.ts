export type Cabin = {
  id: string;
  name_no: string;
  capacity_max: number;
  description_no: string | null;
  position: number;
};

export type ItineraryStop = {
  id: string;
  stop_date: string;
  location_no: string;
  type: "harbor" | "anchorage" | "sail" | "handover";
  notes_no: string | null;
  position: number;
  lat: number | null;
  lng: number | null;
};

export const MAX_GUESTS_PER_NIGHT = 5;
export const SKIPPER_NAME = "Skipper";

export type Booking = {
  id: string;
  guest_name: string;
  cabin_id: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  created_at: string;
};

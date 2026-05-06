export type DeviceType = "PC" | "PS4";

export type Device = {
  id: string;
  name: string;
  type: DeviceType;
  is_active: boolean;
  created_at: string;
};

export type Reservation = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_discord: string | null;
  device_id: string;
  start_time: string;
  end_time: string;
  is_daily_recurring: boolean;
  notes: string | null;
  created_at: string;
};

export type BlockedSlot = {
  id: string;
  device_id: string;
  start_time: string;
  end_time: string;
  reason: string;
};

export type ReservationWithDevice = Reservation & { device: Device };
export type BlockedSlotWithDevice = BlockedSlot & { device: Device };

export type AvailabilityEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  type: "RESERVATION" | "BLOCKED";
};

export type SiteSettings = {
  id: number;
  home_video_url: string | null;
  home_video_path: string | null;
  updated_at: string;
};

export type HomeLogoImage = {
  id: string;
  image_path: string;
  image_url: string;
  created_at: string;
};

export type HomeDrinkImage = {
  id: string;
  image_path: string;
  image_url: string;
  created_at: string;
};

export type Match = {
  id: string;
  title: string;
  match_date: string;
  details: string | null;
  created_at: string;
};

export type MatchReservation = {
  id: string;
  match_id: string;
  seat_number: number;
  customer_name: string;
  customer_phone: string;
  created_at: string;
};


export type DeviceType = "PC" | "PS5";

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


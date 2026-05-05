import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  BlockedSlot,
  BlockedSlotWithDevice,
  Device,
  Reservation,
  ReservationWithDevice,
  SiteSettings,
} from "@/types";

export async function listDevices(): Promise<Device[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .order("type", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listActiveDevices(): Promise<Device[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("is_active", true)
    .order("type", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listReservationsByRange(
  deviceId: string,
  startIso: string,
  endIso: string,
): Promise<Reservation[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("device_id", deviceId)
    .lt("start_time", endIso)
    .gt("end_time", startIso)
    .order("start_time", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listBlockedSlotsByRange(
  deviceId: string,
  startIso: string,
  endIso: string,
): Promise<BlockedSlot[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blocked_slots")
    .select("*")
    .eq("device_id", deviceId)
    .lt("start_time", endIso)
    .gt("end_time", startIso)
    .order("start_time", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listReservationsWithDevice(
  limit = 200,
): Promise<ReservationWithDevice[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*, device:devices(*)")
    .order("start_time", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as ReservationWithDevice[]) ?? [];
}

export async function listBlockedSlotsWithDevice(
  limit = 200,
): Promise<BlockedSlotWithDevice[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blocked_slots")
    .select("*, device:devices(*)")
    .order("start_time", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as BlockedSlotWithDevice[]) ?? [];
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SiteSettings | null) ?? null;
}


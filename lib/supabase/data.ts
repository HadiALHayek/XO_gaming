import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  BlockedSlot,
  BlockedSlotWithDevice,
  Device,
  Match,
  MatchReservation,
  Reservation,
  ReservationWithDevice,
  SiteSettings,
} from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;

function expandDailyReservationInRange(
  reservation: Reservation,
  startIso: string,
  endIso: string,
): Reservation[] {
  if (!reservation.is_daily_recurring) return [reservation];

  const baseStart = new Date(reservation.start_time).getTime();
  const baseEnd = new Date(reservation.end_time).getTime();
  const rangeStart = new Date(startIso).getTime();
  const rangeEnd = new Date(endIso).getTime();
  const duration = baseEnd - baseStart;

  if (
    Number.isNaN(baseStart) ||
    Number.isNaN(baseEnd) ||
    Number.isNaN(rangeStart) ||
    Number.isNaN(rangeEnd) ||
    duration <= 0
  ) {
    return [];
  }

  const baseStartDate = new Date(baseStart);
  const rangeStartDate = new Date(rangeStart);
  let current = Date.UTC(
    rangeStartDate.getUTCFullYear(),
    rangeStartDate.getUTCMonth(),
    rangeStartDate.getUTCDate(),
    baseStartDate.getUTCHours(),
    baseStartDate.getUTCMinutes(),
    baseStartDate.getUTCSeconds(),
    baseStartDate.getUTCMilliseconds(),
  );

  while (current < baseStart) current += DAY_MS;
  while (current + duration <= rangeStart) current += DAY_MS;

  const occurrences: Reservation[] = [];
  while (current < rangeEnd) {
    const occurrenceEnd = current + duration;
    if (occurrenceEnd > rangeStart) {
      const dayKey = new Date(current).toISOString().slice(0, 10);
      occurrences.push({
        ...reservation,
        id: `${reservation.id}-${dayKey}`,
        start_time: new Date(current).toISOString(),
        end_time: new Date(occurrenceEnd).toISOString(),
      });
    }
    current += DAY_MS;
  }

  return occurrences;
}

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
  const [{ data: oneTimeData, error: oneTimeError }, { data: recurringData, error: recurringError }] = await Promise.all([
    supabase
      .from("reservations")
      .select("*")
      .eq("device_id", deviceId)
      .eq("is_daily_recurring", false)
      .lt("start_time", endIso)
      .gt("end_time", startIso)
      .order("start_time", { ascending: true }),
    supabase
      .from("reservations")
      .select("*")
      .eq("device_id", deviceId)
      .eq("is_daily_recurring", true)
      .lt("start_time", endIso)
      .order("start_time", { ascending: true }),
  ]);
  if (oneTimeError) throw new Error(oneTimeError.message);
  if (recurringError) throw new Error(recurringError.message);

  const oneTime = oneTimeData ?? [];
  const recurringExpanded = (recurringData ?? []).flatMap((reservation) =>
    expandDailyReservationInRange(reservation as Reservation, startIso, endIso),
  );
  return [...oneTime, ...recurringExpanded].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );
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

export async function listMatches(): Promise<Match[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Match[]) ?? [];
}

export async function getMatchById(matchId: string): Promise<Match | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Match | null) ?? null;
}

export async function listMatchReservations(matchId: string): Promise<MatchReservation[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("match_reservations")
    .select("*")
    .eq("match_id", matchId)
    .order("seat_number", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as MatchReservation[]) ?? [];
}


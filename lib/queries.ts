import type { Device } from "@/types";
import {
  listActiveDevices,
  listBlockedSlotsByRange,
  listReservationsByRange,
} from "@/lib/supabase/data";

export async function safeDb<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export async function getActiveDevices() {
  return safeDb(listActiveDevices(), [] as Device[]);
}

export async function getDevicesWithCurrentStatus(now: Date = new Date()) {
  const devices = await getActiveDevices();
  if (devices.length === 0) return [];

  const start = now.toISOString();
  const end = new Date(now.getTime() + 1000).toISOString();

  const busy = new Set<string>();
  for (const d of devices) {
    const [reservations, blockedSlots] = await Promise.all([
      safeDb(listReservationsByRange(d.id, start, end), []),
      safeDb(listBlockedSlotsByRange(d.id, start, end), []),
    ]);
    if (reservations.length > 0 || blockedSlots.length > 0) busy.add(d.id);
  }

  return devices.map((d) => ({ ...d, busyNow: busy.has(d.id) }));
}


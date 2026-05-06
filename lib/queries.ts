import type { Device } from "@/types";
import {
  listDevices,
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

type TimeWindow = { start: number; end: number };

function mergeWindows(windows: TimeWindow[]): TimeWindow[] {
  if (windows.length === 0) return [];
  const sorted = [...windows].sort((a, b) => a.start - b.start);
  const merged: TimeWindow[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = merged[merged.length - 1];
    const current = sorted[i];
    if (current.start <= prev.end) {
      prev.end = Math.max(prev.end, current.end);
    } else {
      merged.push(current);
    }
  }
  return merged;
}

async function buildDeviceStatus(devices: Device[], now: Date) {
  if (devices.length === 0) return [];
  const startIso = now.toISOString();
  const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const endIso = horizon.toISOString();
  const nowMs = now.getTime();

  const withStatus = await Promise.all(
    devices.map(async (device) => {
      const [reservations, blockedSlots] = await Promise.all([
        safeDb(listReservationsByRange(device.id, startIso, endIso), []),
        safeDb(listBlockedSlotsByRange(device.id, startIso, endIso), []),
      ]);
      const windows = mergeWindows(
        [...reservations, ...blockedSlots]
          .map((entry) => ({
            start: new Date(entry.start_time).getTime(),
            end: new Date(entry.end_time).getTime(),
          }))
          .filter((entry) => !Number.isNaN(entry.start) && !Number.isNaN(entry.end)),
      );

      const activeWindow = windows.find((entry) => nowMs >= entry.start && nowMs < entry.end);
      const nextWindow = windows.find((entry) => entry.start > nowMs);
      const busyNow = Boolean(activeWindow);

      return {
        ...device,
        busyNow,
        currentReservationEnd: activeWindow ? new Date(activeWindow.end).toISOString() : null,
        nextFreeTime: activeWindow
          ? new Date(activeWindow.end).toISOString()
          : device.is_active
            ? now.toISOString()
            : null,
        nextBusyTime: nextWindow ? new Date(nextWindow.start).toISOString() : null,
      };
    }),
  );

  return withStatus;
}

export async function getDevicesWithCurrentStatus(now: Date = new Date()) {
  const devices = await getActiveDevices();
  return buildDeviceStatus(devices, now);
}

export async function getAllDevicesWithCurrentStatus(now: Date = new Date()) {
  const devices = await safeDb(listDevices(), [] as Device[]);
  return buildDeviceStatus(devices, now);
}


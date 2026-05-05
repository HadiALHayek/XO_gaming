import { listBlockedSlotsByRange, listReservationsByRange } from "@/lib/supabase/data";

export function hasConflict(
  newStart: Date,
  newEnd: Date,
  existingStart: Date,
  existingEnd: Date,
) {
  return newStart < existingEnd && newEnd > existingStart;
}

export async function checkAvailability(deviceId: string, start: Date, end: Date) {
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  const [reservations, blocked] = await Promise.all([
    listReservationsByRange(deviceId, startIso, endIso),
    listBlockedSlotsByRange(deviceId, startIso, endIso),
  ]);

  const reservationConflict = reservations.some((r) =>
    hasConflict(start, end, new Date(r.start_time), new Date(r.end_time)),
  );
  if (reservationConflict) return { ok: false as const, message: "Time overlaps an existing reservation." };

  const blockConflict = blocked.some((b) =>
    hasConflict(start, end, new Date(b.start_time), new Date(b.end_time)),
  );
  if (blockConflict) return { ok: false as const, message: "Selected time is blocked for maintenance." };

  return { ok: true as const };
}


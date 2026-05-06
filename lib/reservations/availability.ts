import { listBlockedSlotsByRange, listReservationsByRange } from "@/lib/supabase/data";

export function hasConflict(
  newStart: Date,
  newEnd: Date,
  existingStart: Date,
  existingEnd: Date,
) {
  return newStart < existingEnd && newEnd > existingStart;
}

type AvailabilityOptions = {
  repeatDaily?: boolean;
  excludeReservationId?: string;
};

function buildCandidateWindows(
  start: Date,
  end: Date,
  repeatDaily: boolean,
  effectiveEnd: Date,
) {
  if (!repeatDaily) return [{ start, end }];
  const DAY_MS = 24 * 60 * 60 * 1000;
  const windows: Array<{ start: Date; end: Date }> = [];
  for (let current = start.getTime(); current < effectiveEnd.getTime(); current += DAY_MS) {
    const duration = end.getTime() - start.getTime();
    windows.push({
      start: new Date(current),
      end: new Date(current + duration),
    });
  }
  return windows;
}

export async function checkAvailability(
  deviceId: string,
  start: Date,
  end: Date,
  options: AvailabilityOptions = {},
) {
  const startIso = start.toISOString();
  const effectiveEnd = options.repeatDaily
    ? new Date(end.getTime() + 30 * 24 * 60 * 60 * 1000)
    : end;
  const endIso = effectiveEnd.toISOString();
  const candidateWindows = buildCandidateWindows(
    start,
    end,
    Boolean(options.repeatDaily),
    effectiveEnd,
  );
  const [reservations, blocked] = await Promise.all([
    listReservationsByRange(deviceId, startIso, endIso),
    listBlockedSlotsByRange(deviceId, startIso, endIso),
  ]);

  const reservationConflict = candidateWindows.some(({ start: candidateStart, end: candidateEnd }) =>
    reservations.some((r) => {
      const baseId = r.id.replace(/-\d{4}-\d{2}-\d{2}$/, "");
      if (options.excludeReservationId && baseId === options.excludeReservationId) {
        return false;
      }
      return hasConflict(
        candidateStart,
        candidateEnd,
        new Date(r.start_time),
        new Date(r.end_time),
      );
    }),
  );
  if (reservationConflict) return { ok: false as const, message: "Time overlaps an existing reservation." };

  const blockConflict = candidateWindows.some(({ start: candidateStart, end: candidateEnd }) =>
    blocked.some((b) =>
      hasConflict(
        candidateStart,
        candidateEnd,
        new Date(b.start_time),
        new Date(b.end_time),
      ),
    ),
  );
  if (blockConflict) return { ok: false as const, message: "Selected time is blocked for maintenance." };

  return { ok: true as const };
}


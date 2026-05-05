import {
  MAX_RESERVATION_MS,
  MIN_RESERVATION_MS,
  MAX_RESERVATION_HOURS,
  MIN_RESERVATION_HOURS,
} from "./constants";

export type Range = { startTime: Date; endTime: Date };

/**
 * Two intervals overlap when the new interval starts before the
 * existing interval ends AND ends after the existing interval starts.
 * Touching boundaries (end == start) are intentionally not treated as overlap.
 */
export function intervalsOverlap(a: Range, b: Range): boolean {
  return a.startTime < b.endTime && a.endTime > b.startTime;
}

export type DurationValidationResult =
  | { ok: true }
  | { ok: false; code: "ORDER" | "MIN" | "MAX"; message: string };

export function validateDuration(range: Range): DurationValidationResult {
  if (!(range.startTime instanceof Date) || !(range.endTime instanceof Date)) {
    return { ok: false, code: "ORDER", message: "Invalid date values." };
  }

  if (range.endTime <= range.startTime) {
    return {
      ok: false,
      code: "ORDER",
      message: "End time must be after start time.",
    };
  }

  const durationMs = range.endTime.getTime() - range.startTime.getTime();

  if (durationMs < MIN_RESERVATION_MS) {
    return {
      ok: false,
      code: "MIN",
      message: `Minimum reservation length is ${MIN_RESERVATION_HOURS} hour.`,
    };
  }

  if (durationMs > MAX_RESERVATION_MS) {
    return {
      ok: false,
      code: "MAX",
      message: `Maximum reservation length is ${MAX_RESERVATION_HOURS} hours.`,
    };
  }

  return { ok: true };
}

export type ConflictItem = Range & {
  id: string;
  source: "RESERVATION" | "BLOCKED_SLOT";
};

export function findConflicts(
  newRange: Range,
  existing: ConflictItem[],
): ConflictItem[] {
  return existing.filter((item) => intervalsOverlap(newRange, item));
}

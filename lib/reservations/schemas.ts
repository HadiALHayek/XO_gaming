import { z } from "zod";
import {
  MAX_RESERVATION_HOURS,
  MAX_RESERVATION_MS,
  MIN_RESERVATION_HOURS,
  MIN_RESERVATION_MS,
} from "./constants";

const isoDate = z
  .string()
  .min(1, "Required")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date",
  });

const syrianLocalPhoneRegex = /^09\d{8}$/;
const syrianIntlPhoneRegex = /^\+{1,2}9639\d{8}$/;

export function normalizeSyrianPhone(value: string) {
  const raw = value.replace(/\s+/g, "");
  if (syrianIntlPhoneRegex.test(raw)) {
    return `+963${raw.replace(/^\+{1,2}963/, "")}`;
  }
  if (syrianLocalPhoneRegex.test(raw)) {
    return `+963${raw.slice(1)}`;
  }
  return null;
}

export const reservationCreateSchema = z
  .object({
    customerName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name is too long"),
    customerPhone: z
      .string()
      .min(1, "Phone number is required")
      .max(30, "Phone is too long")
      .refine((value) => normalizeSyrianPhone(value) !== null, {
        message: "Use a valid Syrian mobile: 09XXXXXXXX or +9639XXXXXXXX",
      }),
    customerDiscord: z
      .string()
      .max(60, "Discord handle is too long")
      .optional()
      .or(z.literal("")),
    guestToken: z.string().max(100).optional().or(z.literal("")),
    deviceIds: z.array(z.string().min(1)).min(1, "Select at least one device"),
    startTime: isoDate,
    durationHours: z.coerce.number().int().min(1).max(12),
    reservationType: z.enum(["ONE_TIME", "DAILY"]).default("ONE_TIME"),
    notes: z.string().max(500).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime).getTime();
    const end = start + data.durationHours * 60 * 60 * 1000;
    if (Number.isNaN(start) || Number.isNaN(end)) return;
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["durationHours"],
        message: "Invalid duration",
      });
      return;
    }
    const duration = end - start;
    if (duration < MIN_RESERVATION_MS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["durationHours"],
        message: `Minimum ${MIN_RESERVATION_HOURS} hour`,
      });
    }
    if (duration > MAX_RESERVATION_MS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["durationHours"],
        message: `Maximum ${MAX_RESERVATION_HOURS} hours`,
      });
    }
  });

export type ReservationCreateInput = z.infer<typeof reservationCreateSchema>;

export const reservationUpdateSchema = reservationCreateSchema.and(
  z.object({ id: z.string().min(1) }),
);

export type ReservationUpdateInput = z.infer<typeof reservationUpdateSchema>;

export const blockedSlotCreateSchema = z
  .object({
    deviceId: z.string().min(1, "Select a device"),
    startTime: isoDate,
    endTime: isoDate,
    reason: z.string().min(2, "Reason is required").max(200),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime).getTime();
    const end = new Date(data.endTime).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return;
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End must be after start",
      });
    }
  });

export type BlockedSlotCreateInput = z.infer<typeof blockedSlotCreateSchema>;

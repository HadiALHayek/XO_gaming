import { z } from "zod";
import { normalizeSyrianPhone } from "@/lib/reservations/schemas";

const isoDate = z
  .string()
  .min(1, "Required")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date",
  });

export const matchCreateSchema = z.object({
  title: z.string().min(2, "Title is required").max(120, "Title is too long"),
  matchDate: isoDate,
  details: z.string().max(1000, "Details are too long").optional().or(z.literal("")),
});

export const matchSeatReservationSchema = z.object({
  matchId: z.string().min(1, "Match is required"),
  customerName: z.string().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
  customerPhone: z
    .string()
    .min(1, "Phone number is required")
    .max(30, "Phone is too long")
    .refine((value) => normalizeSyrianPhone(value) !== null, {
      message: "Use a valid Syrian mobile: 09XXXXXXXX or +9639XXXXXXXX",
    }),
  seats: z
    .array(z.number().int().min(1).max(20))
    .min(1, "Choose at least one seat")
    .max(20)
    .refine((seats) => new Set(seats).size === seats.length, {
      message: "Duplicate seats selected",
    }),
});

export type MatchCreateInput = z.infer<typeof matchCreateSchema>;
export type MatchSeatReservationInput = z.infer<typeof matchSeatReservationSchema>;

import { z } from "zod";
import { normalizeSyrianPhone } from "@/lib/reservations/schemas";

export const downloadRequestSchema = z.object({
  category: z.enum(["GAMES", "SERIES", "FILMS"]),
  fileName: z
    .string()
    .min(2, "File name is required")
    .max(120, "File name is too long"),
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
  guestToken: z.string().max(100).optional().or(z.literal("")),
});

export const downloadRequestAdminUpdateSchema = z.object({
  id: z.string().min(1, "Request id is required"),
  category: z.enum(["GAMES", "SERIES", "FILMS"]),
  status: z.enum(["HOLD", "ON_PROGRESS", "FINISHED"]),
  fileName: z
    .string()
    .min(2, "File name is required")
    .max(120, "File name is too long"),
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
});

export type DownloadRequestInput = z.infer<typeof downloadRequestSchema>;
export type DownloadRequestAdminUpdateInput = z.infer<typeof downloadRequestAdminUpdateSchema>;

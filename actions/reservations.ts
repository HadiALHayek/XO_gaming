"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkAvailability } from "@/lib/reservations/availability";
import {
  normalizeSyrianPhone,
  reservationCreateSchema,
  reservationUpdateSchema,
  type ReservationCreateInput,
  type ReservationUpdateInput,
} from "@/lib/reservations/schemas";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function createReservation(input: ReservationCreateInput): Promise<ActionResult<{ id: string }>> {
  const parsed = reservationCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form." };
  }

  const start = new Date(parsed.data.startTime);
  const end = new Date(start.getTime() + parsed.data.durationHours * 60 * 60 * 1000);
  const normalizedPhone = normalizeSyrianPhone(parsed.data.customerPhone);
  if (!normalizedPhone) return { ok: false, error: "Invalid phone format." };
  for (const deviceId of parsed.data.deviceIds) {
    const availability = await checkAvailability(deviceId, start, end, {
      repeatDaily: parsed.data.reservationType === "DAILY",
    });
    if (!availability.ok) return { ok: false, error: availability.message };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .insert(
      parsed.data.deviceIds.map((deviceId) => ({
        customer_name: parsed.data.customerName.trim(),
        customer_phone: normalizedPhone,
        customer_discord: parsed.data.customerDiscord?.trim() || null,
        device_id: deviceId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        is_daily_recurring: parsed.data.reservationType === "DAILY",
        notes: parsed.data.notes?.trim() || null,
      })),
    )
    .select("id")
    .limit(1);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/book");
  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  return { ok: true, data: { id: (data?.[0]?.id as string) ?? "" } };
}

export async function updateReservation(input: ReservationUpdateInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = reservationUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid reservation data." };

  const start = new Date(parsed.data.startTime);
  const end = new Date(start.getTime() + parsed.data.durationHours * 60 * 60 * 1000);
  const normalizedPhone = normalizeSyrianPhone(parsed.data.customerPhone);
  if (!normalizedPhone) return { ok: false, error: "Invalid phone format." };

  const firstDeviceId = parsed.data.deviceIds[0];
  const availability = await checkAvailability(firstDeviceId, start, end, {
    repeatDaily: parsed.data.reservationType === "DAILY",
    excludeReservationId: parsed.data.id,
  });
  if (!availability.ok) return { ok: false, error: availability.message };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("reservations")
    .update({
      customer_name: parsed.data.customerName.trim(),
      customer_phone: normalizedPhone,
      customer_discord: parsed.data.customerDiscord?.trim() || null,
      device_id: firstDeviceId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      is_daily_recurring: parsed.data.reservationType === "DAILY",
      notes: parsed.data.notes?.trim() || null,
    })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/reservations");
  revalidatePath("/book");
  return { ok: true };
}

export async function deleteReservation(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reservations").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/reservations");
  revalidatePath("/book");
  return { ok: true };
}


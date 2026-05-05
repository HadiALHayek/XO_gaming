"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkAvailability } from "@/lib/reservations/availability";
import {
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
  const availability = await checkAvailability(parsed.data.deviceId, start, end);
  if (!availability.ok) return { ok: false, error: availability.message };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      customer_name: parsed.data.customerName.trim(),
      customer_phone: parsed.data.customerPhone?.trim() || null,
      customer_discord: parsed.data.customerDiscord?.trim() || null,
      device_id: parsed.data.deviceId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      notes: parsed.data.notes?.trim() || null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/book");
  revalidatePath("/admin");
  revalidatePath("/admin/reservations");
  return { ok: true, data: { id: data.id as string } };
}

export async function updateReservation(input: ReservationUpdateInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = reservationUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid reservation data." };

  const start = new Date(parsed.data.startTime);
  const end = new Date(start.getTime() + parsed.data.durationHours * 60 * 60 * 1000);

  const supabase = await createSupabaseServerClient();
  const [{ data: existingRows, error: existingError }, { data: blockedRows, error: blockedError }] = await Promise.all([
    supabase
      .from("reservations")
      .select("id,start_time,end_time")
      .eq("device_id", parsed.data.deviceId)
      .neq("id", parsed.data.id)
      .lt("start_time", end.toISOString())
      .gt("end_time", start.toISOString()),
    supabase
      .from("blocked_slots")
      .select("id,start_time,end_time")
      .eq("device_id", parsed.data.deviceId)
      .lt("start_time", end.toISOString())
      .gt("end_time", start.toISOString()),
  ]);
  if (existingError) return { ok: false, error: existingError.message };
  if (blockedError) return { ok: false, error: blockedError.message };
  if ((existingRows ?? []).length > 0) return { ok: false, error: "Time overlaps an existing reservation." };
  if ((blockedRows ?? []).length > 0) return { ok: false, error: "Selected time is blocked for maintenance." };

  const { error } = await supabase
    .from("reservations")
    .update({
      customer_name: parsed.data.customerName.trim(),
      customer_phone: parsed.data.customerPhone?.trim() || null,
      customer_discord: parsed.data.customerDiscord?.trim() || null,
      device_id: parsed.data.deviceId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
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


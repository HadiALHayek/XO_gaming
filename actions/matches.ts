"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  matchCreateSchema,
  matchSeatReservationSchema,
  type MatchCreateInput,
  type MatchSeatReservationInput,
} from "@/lib/matches/schemas";
import { normalizeSyrianPhone } from "@/lib/reservations/schemas";
import type { ActionResult } from "@/actions/reservations";

export async function createMatch(input: MatchCreateInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = matchCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("matches")
    .insert({
      title: parsed.data.title.trim(),
      match_date: new Date(parsed.data.matchDate).toISOString(),
      details: parsed.data.details?.trim() || null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/matches");
  revalidatePath("/admin/matches");
  return { ok: true, data: { id: data.id as string } };
}

export async function deleteMatch(matchId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/matches");
  revalidatePath("/admin/matches");
  revalidatePath(`/matches/${matchId}`);
  return { ok: true };
}

export async function createMatchSeatReservation(
  input: MatchSeatReservationInput,
): Promise<ActionResult> {
  const parsed = matchSeatReservationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form." };
  }

  const normalizedPhone = normalizeSyrianPhone(parsed.data.customerPhone);
  if (!normalizedPhone) return { ok: false, error: "Invalid phone format." };

  const supabase = await createSupabaseServerClient();
  const { data: existing, error: existingError } = await supabase
    .from("match_reservations")
    .select("seat_number")
    .eq("match_id", parsed.data.matchId)
    .in("seat_number", parsed.data.seats);

  if (existingError) return { ok: false, error: existingError.message };
  if ((existing ?? []).length > 0) {
    return { ok: false, error: "One or more selected seats are already reserved." };
  }

  const { error } = await supabase.from("match_reservations").insert(
    parsed.data.seats.map((seatNumber) => ({
      match_id: parsed.data.matchId,
      seat_number: seatNumber,
      customer_name: parsed.data.customerName.trim(),
      customer_phone: normalizedPhone,
    })),
  );

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "One or more selected seats are already reserved." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/matches");
  revalidatePath(`/matches/${parsed.data.matchId}`);
  return { ok: true };
}

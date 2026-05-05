"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { blockedSlotCreateSchema, type BlockedSlotCreateInput } from "@/lib/reservations/schemas";
import { ActionResult } from "@/actions/reservations";

export async function createBlockedSlot(input: BlockedSlotCreateInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = blockedSlotCreateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid slot." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("blocked_slots").insert({
    device_id: parsed.data.deviceId,
    start_time: new Date(parsed.data.startTime).toISOString(),
    end_time: new Date(parsed.data.endTime).toISOString(),
    reason: parsed.data.reason.trim(),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/blocked-slots");
  revalidatePath("/book");
  return { ok: true };
}

export async function deleteBlockedSlot(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/blocked-slots");
  revalidatePath("/book");
  return { ok: true };
}


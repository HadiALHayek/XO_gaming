"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ActionResult } from "@/actions/reservations";

export async function setDeviceActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("devices").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/devices");
  revalidatePath("/book");
  revalidatePath("/");
  return { ok: true };
}


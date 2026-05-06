"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSyrianPhone } from "@/lib/reservations/schemas";
import {
  downloadRequestAdminUpdateSchema,
  downloadRequestSchema,
  type DownloadRequestAdminUpdateInput,
  type DownloadRequestInput,
} from "@/lib/downloads/schemas";

export type DownloadActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createDownloadRequest(
  input: DownloadRequestInput,
): Promise<DownloadActionResult> {
  const parsed = downloadRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form." };
  }

  const normalizedPhone = normalizeSyrianPhone(parsed.data.customerPhone);
  if (!normalizedPhone) return { ok: false, error: "Invalid phone format." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("download_requests").insert({
    category: parsed.data.category,
    status: "HOLD",
    file_name: parsed.data.fileName.trim(),
    customer_name: parsed.data.customerName.trim(),
    customer_phone: normalizedPhone,
    guest_token: parsed.data.guestToken?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/downloads");
  revalidatePath("/admin/downloads");
  revalidatePath("/my-activity");
  return { ok: true };
}

export async function updateDownloadRequestByAdmin(
  input: DownloadRequestAdminUpdateInput,
): Promise<DownloadActionResult> {
  await requireAdmin();
  const parsed = downloadRequestAdminUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid form." };
  }
  const normalizedPhone = normalizeSyrianPhone(parsed.data.customerPhone);
  if (!normalizedPhone) return { ok: false, error: "Invalid phone format." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("download_requests")
    .update({
      category: parsed.data.category,
      status: parsed.data.status,
      file_name: parsed.data.fileName.trim(),
      customer_name: parsed.data.customerName.trim(),
      customer_phone: normalizedPhone,
    })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/downloads");
  revalidatePath("/my-activity");
  return { ok: true };
}

export async function deleteDownloadRequestByAdmin(id: string): Promise<DownloadActionResult> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("download_requests").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/downloads");
  revalidatePath("/my-activity");
  return { ok: true };
}

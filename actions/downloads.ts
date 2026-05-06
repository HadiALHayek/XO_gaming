"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSyrianPhone } from "@/lib/reservations/schemas";
import {
  downloadRequestSchema,
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
    file_name: parsed.data.fileName.trim(),
    customer_name: parsed.data.customerName.trim(),
    customer_phone: normalizedPhone,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/downloads");
  revalidatePath("/admin/downloads");
  return { ok: true };
}

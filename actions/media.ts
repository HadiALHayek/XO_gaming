"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MediaActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function setHomeVideo(
  homeVideoPath: string,
  homeVideoUrl: string,
): Promise<MediaActionResult> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("site_settings").upsert(
    {
      id: 1,
      home_video_path: homeVideoPath,
      home_video_url: homeVideoUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/media");
  return { ok: true };
}

export async function clearHomeVideo(): Promise<MediaActionResult> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      home_video_path: null,
      home_video_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/media");
  return { ok: true };
}


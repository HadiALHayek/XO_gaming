import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export async function getAdminUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Use in server actions and admin server components to ensure the request
 * is authenticated. When Supabase is not configured (e.g. local demo without
 * env vars) this throws to prevent accidental privileged writes.
 */
export async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Admin authentication is not configured. Set Supabase environment variables.",
    );
  }
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

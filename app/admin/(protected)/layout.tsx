import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container py-12">
        <div className="glass mx-auto max-w-xl space-y-3 p-8 text-sm">
          <h1 className="font-display text-xl font-semibold">
            Admin disabled
          </h1>
          <p className="text-muted-foreground">
            Supabase environment variables are missing. Configure
            <code className="mx-1 rounded bg-black/40 px-1">
              NEXT_PUBLIC_SUPABASE_URL
            </code>
            and
            <code className="mx-1 rounded bg-black/40 px-1">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
            and create an admin user to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  const user = await getAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="container flex flex-col gap-6 py-6 lg:flex-row">
      <AdminSidebar email={user.email} />
      <div className="flex-1 space-y-6">{children}</div>
    </div>
  );
}

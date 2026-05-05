import { redirect } from "next/navigation";
import { Gamepad2 } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { getAdminUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Admin login",
};

export default async function LoginPage() {
  const supabaseReady = isSupabaseConfigured();
  if (supabaseReady) {
    const user = await getAdminUser();
    if (user) redirect("/admin");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon">
              <Gamepad2 className="h-6 w-6 text-white" />
            </span>
            <div>
              <h1 className="font-display text-xl font-semibold">
                Admin sign in
              </h1>
              <p className="text-xs text-muted-foreground">
                Restricted area for XO Gaming staff.
              </p>
            </div>
          </div>

          {supabaseReady ? (
            <LoginForm />
          ) : (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
              Supabase is not configured. Set
              <code className="mx-1 rounded bg-black/40 px-1">
                NEXT_PUBLIC_SUPABASE_URL
              </code>
              and
              <code className="mx-1 rounded bg-black/40 px-1">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>
              in your environment, then create an admin user in the Supabase
              dashboard. See the README for full instructions.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

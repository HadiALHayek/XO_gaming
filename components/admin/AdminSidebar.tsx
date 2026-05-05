"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Gauge,
  Gamepad2,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: Gauge, exact: true },
  { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/admin/devices", label: "Devices", icon: Gamepad2 },
  { href: "/admin/blocked-slots", label: "Maintenance", icon: ShieldAlert },
];

export function AdminSidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="glass sticky top-4 flex h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden p-4 lg:w-64">
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 px-2 text-base font-semibold"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon">
          <Gamepad2 className="h-5 w-5 text-white" />
        </span>
        <span className="gradient-text font-display tracking-tight">
          XO Gaming
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "border border-neon-purple/40 bg-neon-purple/10 text-foreground shadow-neon-purple"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/5 pt-3">
        {email ? (
          <div className="px-2 text-xs text-muted-foreground">
            Signed in as
            <div className="truncate text-foreground">{email}</div>
          </div>
        ) : null}
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}

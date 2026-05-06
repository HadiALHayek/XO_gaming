import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export async function Navbar() {
  const [user, { t }] = await Promise.all([getAdminUser(), getDictionary()]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-neon-purple to-neon-cyan shadow-neon">
            <Gamepad2 className="h-5 w-5 text-white" />
          </span>
          <span className="gradient-text font-display tracking-tight">
            {t.brand}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.nav.home}
          </Link>
          <Link
            href="/book"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.nav.book}
          </Link>
          <Link
            href="/matches"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Matches
          </Link>
          <Link
            href="/downloads"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Downloads
          </Link>
          <Link
            href={user ? "/admin" : "/admin/login"}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.nav.admin}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div>
            <LanguageSwitcher />
          </div>
          <Button asChild size="sm" variant="neon" className="hidden sm:inline-flex">
            <Link href="/book">{t.nav.bookNow}</Link>
          </Button>
          <Button asChild size="sm" className="sm:hidden">
            <Link href="/book">{t.nav.book}</Link>
          </Button>
        </div>
      </div>
      <div className="container pb-3 md:hidden">
        <nav className="flex flex-wrap items-center gap-3 text-xs">
          <Link
            href="/"
            className="rounded-full border border-white/10 px-3 py-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.nav.home}
          </Link>
          <Link
            href="/book"
            className="rounded-full border border-white/10 px-3 py-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.nav.book}
          </Link>
          <Link
            href="/matches"
            className="rounded-full border border-white/10 px-3 py-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            Matches
          </Link>
          <Link
            href="/downloads"
            className="rounded-full border border-white/10 px-3 py-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            Downloads
          </Link>
          <Link
            href={user ? "/admin" : "/admin/login"}
            className="rounded-full border border-white/10 px-3 py-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.nav.admin}
          </Link>
        </nav>
      </div>
    </header>
  );
}

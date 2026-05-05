import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";

export async function Footer() {
  const { t } = await getDictionary();
  return (
    <footer className="mt-24 border-t border-white/5 bg-background/40 backdrop-blur-xl">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-4 w-4 text-neon-cyan" />
          <span>{t.brand}</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-foreground">
            {t.nav.home}
          </Link>
          <Link href="/book" className="hover:text-foreground">
            {t.nav.book}
          </Link>
          <Link href="/admin" className="hover:text-foreground">
            {t.nav.admin}
          </Link>
        </div>
        <div>(c) {new Date().getFullYear()} {t.brand}. {t.footer.rights}</div>
      </div>
    </footer>
  );
}

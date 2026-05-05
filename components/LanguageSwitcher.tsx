"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/I18nProvider";
import { type Locale } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [pending, startTransition] = useTransition();

  async function setLocale(nextLocale: Locale) {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
      <Button
        type="button"
        size="sm"
        variant={locale === "en" ? "neon" : "ghost"}
        className="h-8 px-2 text-xs"
        disabled={pending}
        onClick={() => setLocale("en")}
      >
        {t.language.english}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={locale === "ar" ? "neon" : "ghost"}
        className="h-8 px-2 text-xs"
        disabled={pending}
        onClick={() => setLocale("ar")}
      >
        {t.language.arabic}
      </Button>
    </div>
  );
}


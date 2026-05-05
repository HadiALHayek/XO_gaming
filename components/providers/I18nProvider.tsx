"use client";

import { createContext, useContext } from "react";
import {
  translations,
  type Locale,
} from "@/lib/i18n/translations";

type LocaleDictionary = (typeof translations)["en"] | (typeof translations)["ar"];

const I18nContext = createContext<{ locale: Locale; t: LocaleDictionary } | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}


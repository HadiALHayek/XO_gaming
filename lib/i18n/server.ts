import { cookies } from "next/headers";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  translations,
  type Locale,
} from "./translations";

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(localeCookieName)?.value;
  if (fromCookie && isLocale(fromCookie)) return fromCookie;
  return defaultLocale;
}

export async function getDictionary() {
  const locale = await getCurrentLocale();
  return { locale, t: translations[locale] };
}


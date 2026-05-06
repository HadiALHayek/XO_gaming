const GUEST_TOKEN_KEY = "xo_guest_token";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function getOrCreateGuestToken() {
  if (typeof window === "undefined") return "";
  const existingCookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${GUEST_TOKEN_KEY}=`))
    ?.split("=")[1];
  if (existingCookie) return decodeURIComponent(existingCookie);

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  document.cookie = `${GUEST_TOKEN_KEY}=${encodeURIComponent(generated)}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
  return generated;
}

const GUEST_TOKEN_KEY = "xo_guest_token";

export function getOrCreateGuestToken() {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(GUEST_TOKEN_KEY);
  if (existing) return existing;
  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  window.localStorage.setItem(GUEST_TOKEN_KEY, generated);
  return generated;
}

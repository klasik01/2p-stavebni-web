export type CookieConsentState = "accepted" | "rejected" | "unset";

const COOKIE_CONSENT_KEY = "p-stavebni-cookie-consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

export function getCookieConsent(): CookieConsentState {
  if (typeof document === "undefined") return "unset";

  const value = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${COOKIE_CONSENT_KEY}=`))
    ?.split("=")[1];

  if (value === "accepted" || value === "rejected") {
    return value;
  }

  return "unset";
}

export function setCookieConsent(state: Exclude<CookieConsentState, "unset">) {
  if (typeof document === "undefined") return;

  document.cookie = [
    `${COOKIE_CONSENT_KEY}=${state}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE}`,
    "SameSite=Lax",
  ].join("; ");
}

import { contacts } from "../contacts";

/** Base URL of the production site. Used to build absolute URLs in OG/canonical/JSON-LD. */
export const SITE_URL = "https://2pstavebni.cz";

/** Default author / publisher used on every page unless overridden. */
export const SITE_AUTHOR = "2P Stavební s.r.o.";

/** Default OG image (must be absolute). ≥ 1200×630 recommended. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/images/projects/6/1.jpg`;

/** Default Twitter card type. */
export const DEFAULT_TWITTER_CARD = "summary_large_image";

/** Locale of the default language. */
export const DEFAULT_LOCALE = "cs_CZ";
export const DEFAULT_LANGUAGE = "cs";

/** Re-exported for schema.org telephone in one place. */
export const CONTACT_PHONE_RAW = contacts.phone.replace(/\s+/g, "");

import { get, onValue, ref, set, type Unsubscribe } from "firebase/database";
import { database } from "../lib/firebase";
import type { ManagedContent, SiteContent } from "../types/content";

export const ADMIN_ROUTE = "#/admin";
export const ADMIN_PROJECTS_ROUTE = "#/admin/projects";
export const ADMIN_PROMOTIONS_ROUTE = "#/admin/promotions";
export const ADMIN_SESSION_KEY = "p-stavebni-admin-session";
export const FIREBASE_CONTENT_PATH = "p-stavebni/content";

export function loadManagedContent(baseContent: SiteContent): SiteContent {
  return baseContent;
}

export function isAdminSessionActive() {
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function setAdminSession(active: boolean) {
  if (active) {
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    return;
  }

  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

function mergeManagedContent(baseContent: SiteContent, parsed: Partial<ManagedContent>): SiteContent {
  return {
    ...baseContent,
    projects: {
      ...baseContent.projects,
      items: Array.isArray(parsed.projects) ? parsed.projects : baseContent.projects.items,
    },
    promotions: {
      items: Array.isArray(parsed.promotions) ? parsed.promotions : baseContent.promotions.items,
    },
  };
}

export async function loadManagedContentFromFirebase(baseContent: SiteContent) {
  try {
    const snapshot = await get(ref(database, FIREBASE_CONTENT_PATH));
    if (!snapshot.exists()) {
      return baseContent;
    }

    const parsed = snapshot.val() as Partial<ManagedContent>;
    return mergeManagedContent(baseContent, parsed);
  } catch {
    return baseContent;
  }
}

export async function saveManagedContentToFirebase(content: ManagedContent) {
  await set(ref(database, FIREBASE_CONTENT_PATH), content);
}

export function subscribeManagedContentFromFirebase(
  baseContent: SiteContent,
  onContent: (content: SiteContent) => void,
  onError?: () => void,
): Unsubscribe {
  return onValue(
    ref(database, FIREBASE_CONTENT_PATH),
    (snapshot) => {
      if (!snapshot.exists()) {
        onContent(baseContent);
        return;
      }

      const parsed = snapshot.val() as Partial<ManagedContent>;
      onContent(mergeManagedContent(baseContent, parsed));
    },
    () => {
      onError?.();
    },
  );
}

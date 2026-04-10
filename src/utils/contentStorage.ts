import { get, ref, set } from "firebase/database";
import { database } from "../lib/firebase";
import type { ManagedContent, SiteContent } from "../types/content";

export const ADMIN_ROUTE = "#/admin";
export const ADMIN_PROJECTS_ROUTE = "#/admin/projects";
export const ADMIN_PROMOTIONS_ROUTE = "#/admin/promotions";
export const ADMIN_CONTENT_KEY = "two-p-stavebni-managed-content";
export const ADMIN_SESSION_KEY = "two-p-stavebni-admin-session";
export const FIREBASE_CONTENT_PATH = "two-p-stavebni/content";

export function loadManagedContent(baseContent: SiteContent): SiteContent {
  if (typeof window === "undefined") return baseContent;

  try {
    const raw = window.localStorage.getItem(ADMIN_CONTENT_KEY);
    if (!raw) return baseContent;

    const parsed = JSON.parse(raw) as Partial<ManagedContent>;

    return {
      ...baseContent,
      projects: {
        ...baseContent.projects,
        items: Array.isArray(parsed.projects) ? parsed.projects : baseContent.projects.items,
      },
      promotions: {
        items: Array.isArray(parsed.promotions)
          ? parsed.promotions
          : baseContent.promotions.items,
      },
    };
  } catch {
    return baseContent;
  }
}

export function saveManagedContent(content: ManagedContent) {
  window.localStorage.setItem(ADMIN_CONTENT_KEY, JSON.stringify(content));
}

export function clearManagedContent() {
  window.localStorage.removeItem(ADMIN_CONTENT_KEY);
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

export async function loadManagedContentFromFirebase(baseContent: SiteContent) {
  try {
    const snapshot = await get(ref(database, FIREBASE_CONTENT_PATH));
    if (!snapshot.exists()) {
      return loadManagedContent(baseContent);
    }

    const parsed = snapshot.val() as Partial<ManagedContent>;
    const resolvedContent: SiteContent = {
      ...baseContent,
      projects: {
        ...baseContent.projects,
        items: Array.isArray(parsed.projects) ? parsed.projects : baseContent.projects.items,
      },
      promotions: {
        items: Array.isArray(parsed.promotions)
          ? parsed.promotions
          : baseContent.promotions.items,
      },
    };

    saveManagedContent({
      projects: resolvedContent.projects.items,
      promotions: resolvedContent.promotions.items,
    });

    return resolvedContent;
  } catch {
    return loadManagedContent(baseContent);
  }
}

export async function saveManagedContentToFirebase(content: ManagedContent) {
  await set(ref(database, FIREBASE_CONTENT_PATH), content);
  saveManagedContent(content);
}

import { get, onValue, ref, set, type Unsubscribe } from "firebase/database";
import { database } from "../lib/firebase";
import type { ManagedContent, Project, SiteContent } from "../types/content";

export const ADMIN_ROUTE = "#/admin";
export const ADMIN_PROJECTS_ROUTE = "#/admin/projects";
export const ADMIN_PROMOTIONS_ROUTE = "#/admin/promotions";
export const ADMIN_EMPLOYEES_ROUTE = "#/admin/employees";
export const ADMIN_SESSION_KEY = "p-stavebni-admin-session";
export const FIREBASE_CONTENT_PATH = "p-stavebni/content";
export const FIREBASE_PROJECT_DISPLAY_PATH = "p-stavebni/project-display";

type ProjectDisplaySettings = {
  order?: string[];
  visibility?: Record<string, boolean>;
};

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
      items: Array.isArray(parsed.promotions) ? parsed.promotions : [],
    },
    contact: {
      ...baseContent.contact,
      team: Array.isArray(parsed.team) ? parsed.team : [],
    },
  };
}

function applyProjectDisplaySettings(
  projects: Project[],
  settings?: Partial<ProjectDisplaySettings>,
) {
  const order = Array.isArray(settings?.order) ? settings.order : [];
  const visibility = settings?.visibility ?? {};
  const projectMap = new Map(projects.map((project) => [project.slug, project]));

  const orderedProjects = order
    .map((slug) => projectMap.get(slug))
    .filter((project): project is Project => Boolean(project));

  const remainingProjects = projects.filter((project) => !order.includes(project.slug));
  const resolvedProjects = [...orderedProjects, ...remainingProjects];

  return resolvedProjects.map((project) => ({
    ...project,
    hidden:
      typeof visibility[project.slug] === "boolean"
        ? !visibility[project.slug]
        : Boolean(project.hidden),
  }));
}

function mergeFirebaseState(
  baseContent: SiteContent,
  contentSnapshot: Partial<ManagedContent> | null,
  projectDisplaySnapshot?: Partial<ProjectDisplaySettings> | null,
) {
  const mergedContent = contentSnapshot
    ? mergeManagedContent(baseContent, contentSnapshot)
    : baseContent;

  return {
    ...mergedContent,
    projects: {
      ...mergedContent.projects,
      items: applyProjectDisplaySettings(
        mergedContent.projects.items,
        projectDisplaySnapshot ?? undefined,
      ),
    },
  };
}

function stripProjectDisplayState(projects: Project[]): Project[] {
  return projects.map(({ hidden, ...project }) => project);
}

export function buildProjectDisplaySettings(projects: Project[]): ProjectDisplaySettings {
  return {
    order: projects.map((project) => project.slug),
    visibility: Object.fromEntries(
      projects.map((project) => [project.slug, !project.hidden]),
    ),
  };
}

export async function loadManagedContentFromFirebase(baseContent: SiteContent) {
  try {
    const [contentSnapshot, projectDisplaySnapshot] = await Promise.all([
      get(ref(database, FIREBASE_CONTENT_PATH)),
      get(ref(database, FIREBASE_PROJECT_DISPLAY_PATH)),
    ]);

    return mergeFirebaseState(
      baseContent,
      contentSnapshot.exists() ? (contentSnapshot.val() as Partial<ManagedContent>) : null,
      projectDisplaySnapshot.exists()
        ? (projectDisplaySnapshot.val() as Partial<ProjectDisplaySettings>)
        : null,
    );
  } catch {
    return baseContent;
  }
}

export async function saveManagedContentToFirebase(content: ManagedContent) {
  await set(ref(database, FIREBASE_CONTENT_PATH), {
    ...content,
    projects: stripProjectDisplayState(content.projects),
  });
}

export async function saveProjectDisplaySettingsToFirebase(projects: Project[]) {
  await set(ref(database, FIREBASE_PROJECT_DISPLAY_PATH), buildProjectDisplaySettings(projects));
}

export function subscribeManagedContentFromFirebase(
  baseContent: SiteContent,
  onContent: (content: SiteContent) => void,
  onError?: () => void,
): Unsubscribe {
  let latestContent: Partial<ManagedContent> | null = null;
  let latestProjectDisplay: Partial<ProjectDisplaySettings> | null = null;

  const emit = () => {
    onContent(mergeFirebaseState(baseContent, latestContent, latestProjectDisplay));
  };

  const unsubscribeContent = onValue(
    ref(database, FIREBASE_CONTENT_PATH),
    (snapshot) => {
      latestContent = snapshot.exists() ? (snapshot.val() as Partial<ManagedContent>) : null;
      emit();
    },
    () => {
      onError?.();
    },
  );

  const unsubscribeProjectDisplay = onValue(
    ref(database, FIREBASE_PROJECT_DISPLAY_PATH),
    (snapshot) => {
      latestProjectDisplay = snapshot.exists()
        ? (snapshot.val() as Partial<ProjectDisplaySettings>)
        : null;
      emit();
    },
    () => {
      onError?.();
    },
  );

  return () => {
    unsubscribeContent();
    unsubscribeProjectDisplay();
  };
}

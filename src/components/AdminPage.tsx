import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { auth } from "../lib/firebase";
import type { ManagedContent, Project, ProjectImage, Promotion, SiteContent } from "../types/content";
import {
  ADMIN_PROJECTS_ROUTE,
  ADMIN_PROMOTIONS_ROUTE,
  clearManagedContent,
  saveManagedContentToFirebase,
} from "../utils/contentStorage";
import { normalizeProjectImages } from "../utils/projectImages";
import { removeProjectImage, removeProjectImages, uploadProjectImage } from "../utils/storage";
import { Icon } from "./Icon";

type AdminPageProps = {
  content: SiteContent;
  defaultContent: SiteContent;
  onContentChange: (content: SiteContent) => void;
  currentSection: "projects" | "promotions";
};

type ConfirmState = {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
};

type ProjectEditor = {
  editorId: string;
  savedSlug: string | null;
  project: Project;
};

function createEditorId() {
  return `editor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneProject(project: Project): Project {
  return {
    ...project,
    images: project.images.map((image) => ({ ...image })),
  };
}

function createEmptyProject(): Project {
  return {
    slug: `projekt-${Date.now()}`,
    category: "Realizované zakázky",
    title: "Nový projekt",
    summary: "",
    location: "",
    images: [],
  };
}

function createEmptyPromotion(): Promotion {
  return {
    id: `promo-${Date.now()}`,
    enabled: false,
    startsAt: "",
    endsAt: "",
    badge: "Nová akce",
    title: "Nová promo akce",
    text: "",
    ctaLabel: "Zjistit více",
    ctaHref: "#kontakt",
  };
}

function cloneManagedContent(content: SiteContent): ManagedContent {
  return {
    projects: content.projects.items.map(cloneProject),
    promotions: content.promotions.items.map((promotion) => ({ ...promotion })),
  };
}

function normalizeProject(project: Project): Project {
  return {
    ...project,
    images: normalizeProjectImages(project.images),
  };
}

function createProjectEditor(project: Project): ProjectEditor {
  return {
    editorId: createEditorId(),
    savedSlug: project.slug,
    project: normalizeProject(cloneProject(project)),
  };
}

function serializeProject(project: Project) {
  return JSON.stringify(normalizeProject(project));
}

function getProjectStoragePaths(images: ProjectImage[]) {
  return images
    .map((image) => image.storagePath)
    .filter((storagePath): storagePath is string => Boolean(storagePath));
}

function getProjectSummary(project: Project) {
  const total = project.images.length;
  const visible = project.images.filter((image) => !image.hidden && image.src).length;
  const primary = project.images.find((image) => image.isPrimary && !image.hidden)?.src;

  return {
    total,
    visible,
    hasPrimary: Boolean(primary),
  };
}

function moveItem<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length || from === to) return items;
  const copy = [...items];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function AdminPage({
  content,
  defaultContent,
  onContentChange,
  currentSection,
}: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSavingPromotions, setIsSavingPromotions] = useState(false);
  const [savingProjectIds, setSavingProjectIds] = useState<string[]>([]);
  const [promotionDraft, setPromotionDraft] = useState<Promotion[]>(() =>
    cloneManagedContent(content).promotions,
  );
  const [projectEditors, setProjectEditors] = useState<ProjectEditor[]>(() =>
    content.projects.items.map(createProjectEditor),
  );
  const [openProjects, setOpenProjects] = useState<string[]>([]);
  const [openPromotions, setOpenPromotions] = useState<string[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [uploadingKeys, setUploadingKeys] = useState<string[]>([]);

  const promotionsChanged = useMemo(
    () => JSON.stringify(promotionDraft) !== JSON.stringify(content.promotions.items),
    [content.promotions.items, promotionDraft],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(Boolean(user));
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setPromotionDraft(content.promotions.items.map((promotion) => ({ ...promotion })));
  }, [content.promotions.items]);

  const requestConfirmation = (state: ConfirmState) => {
    setConfirmState(state);
  };

  const setUploadingState = (key: string, isActive: boolean) => {
    setUploadingKeys((current) =>
      isActive ? [...new Set([...current, key])] : current.filter((item) => item !== key),
    );
  };

  const setSavingProjectState = (editorId: string, isActive: boolean) => {
    setSavingProjectIds((current) =>
      isActive ? [...new Set([...current, editorId])] : current.filter((item) => item !== editorId),
    );
  };

  const getSavedProject = (editor: ProjectEditor) => {
    if (!editor.savedSlug) return null;
    return content.projects.items.find((project) => project.slug === editor.savedSlug) ?? null;
  };

  const isProjectDirty = (editor: ProjectEditor) => {
    const savedProject = getSavedProject(editor);
    if (!savedProject) return true;
    return serializeProject(editor.project) !== serializeProject(savedProject);
  };

  const updateProjectEditor = (
    editorId: string,
    updater: (project: Project) => Project,
  ) => {
    setProjectEditors((current) =>
      current.map((editor) =>
        editor.editorId === editorId
          ? { ...editor, project: normalizeProject(updater(cloneProject(editor.project))) }
          : editor,
      ),
    );
  };

  const cancelProjectChanges = async (editor: ProjectEditor) => {
    const savedProject = getSavedProject(editor);
    if (!savedProject) {
      await removeProjectImages(editor.project.images);
      setProjectEditors((current) => current.filter((item) => item.editorId !== editor.editorId));
      setOpenProjects((current) => current.filter((item) => item !== editor.editorId));
      return;
    }

    const savedPaths = new Set(getProjectStoragePaths(savedProject.images));
    const newUploads = editor.project.images.filter(
      (image) => image.storagePath && !savedPaths.has(image.storagePath),
    );
    await removeProjectImages(newUploads);

    setProjectEditors((current) =>
      current.map((item) =>
        item.editorId === editor.editorId
          ? { ...item, project: normalizeProject(cloneProject(savedProject)) }
          : item,
      ),
    );
  };

  const saveProjectChanges = async (editor: ProjectEditor) => {
    const normalizedProject = normalizeProject(editor.project);

    if (!normalizedProject.title.trim()) {
      setNotice("Projekt musí mít název.");
      window.setTimeout(() => setNotice(""), 3000);
      return;
    }

    const validImages = normalizedProject.images.filter((image) => image.src);
    const visibleImages = validImages.filter((image) => !image.hidden);

    if (validImages.length === 0) {
      setNotice("Projekt musí mít alespoň jeden obrázek.");
      window.setTimeout(() => setNotice(""), 3000);
      return;
    }

    if (visibleImages.length === 0) {
      setNotice("Projekt musí mít alespoň jeden viditelný obrázek.");
      window.setTimeout(() => setNotice(""), 3000);
      return;
    }

    setSavingProjectState(editor.editorId, true);

    try {
      const savedProject = getSavedProject(editor);
      const nextProjects = [...content.projects.items];
      const savedIndex = savedProject
        ? nextProjects.findIndex((project) => project.slug === savedProject.slug)
        : -1;

      if (savedIndex >= 0) {
        nextProjects[savedIndex] = normalizedProject;
      } else {
        nextProjects.unshift(normalizedProject);
      }

      await saveManagedContentToFirebase({
        projects: nextProjects,
        promotions: promotionDraft,
      });

      const removedImages = savedProject
        ? savedProject.images.filter(
            (image) =>
              image.storagePath &&
              !getProjectStoragePaths(normalizedProject.images).includes(image.storagePath),
          )
        : [];

      if (removedImages.length > 0) {
        await removeProjectImages(removedImages);
      }

      onContentChange({
        ...content,
        projects: { ...content.projects, items: nextProjects },
        promotions: { items: promotionDraft },
      });

      setProjectEditors((current) =>
        current.map((item) =>
          item.editorId === editor.editorId
            ? {
                ...item,
                savedSlug: normalizedProject.slug,
                project: cloneProject(normalizedProject),
              }
            : item,
        ),
      );

      setNotice(`Projekt "${normalizedProject.title}" byl uložen.`);
      window.setTimeout(() => setNotice(""), 2500);
    } catch {
      setNotice("Uložení projektu se nepodařilo. Zkontroluj databázi a oprávnění.");
      window.setTimeout(() => setNotice(""), 4000);
    } finally {
      setSavingProjectState(editor.editorId, false);
    }
  };

  const savePromotions = async () => {
    setIsSavingPromotions(true);

    try {
      await saveManagedContentToFirebase({
        projects: content.projects.items,
        promotions: promotionDraft,
      });

      onContentChange({
        ...content,
        promotions: { items: promotionDraft },
      });

      setNotice("Akce byly uloženy do Firebase databáze.");
      window.setTimeout(() => setNotice(""), 3000);
    } catch {
      setNotice("Uložení akcí se nepodařilo. Zkontroluj pravidla databáze.");
      window.setTimeout(() => setNotice(""), 4000);
    } finally {
      setIsSavingPromotions(false);
    }
  };

  const resetPromotionsToDefault = () => {
    clearManagedContent();
    setPromotionDraft(defaultContent.promotions.items.map((promotion) => ({ ...promotion })));
    onContentChange({
      ...content,
      promotions: { items: defaultContent.promotions.items },
    });
    setNotice("Akce byly vráceny na výchozí hodnoty z projektu.");
    window.setTimeout(() => setNotice(""), 3000);
  };

  const toggleProject = (editorId: string) => {
    setOpenProjects((current) =>
      current.includes(editorId)
        ? current.filter((item) => item !== editorId)
        : [...current, editorId],
    );
  };

  const togglePromotion = (id: string) => {
    setOpenPromotions((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  if (isAuthLoading) {
    return (
      <main className="admin-shell">
        <section className="admin-login">
          <div className="admin-login-card">
            <span className="section-label">Ověření přihlášení</span>
            <h1>Načítám administraci</h1>
            <p>Ověřuji přihlášení přes Firebase Auth.</p>
          </div>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="admin-shell">
        <section className="admin-login">
          <div className="admin-login-card">
            <span className="section-label">Neveřejná správa</span>
            <h1>Administrace obsahu</h1>
            <p>
              Tato stránka je určená pro interní správu projektů a promo akcí. Přihlášení je
              ověřované přes Firebase Auth.
            </p>
            <form
              className="admin-login-form"
              onSubmit={async (event) => {
                event.preventDefault();
                setError("");
                setIsLoggingIn(true);

                try {
                  await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
                } catch {
                  setError("Přihlášení se nepodařilo. Zkontroluj email, heslo a Firebase Auth.");
                } finally {
                  setIsLoggingIn(false);
                }
              }}
            >
              <label>
                Email
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(event) =>
                    setCredentials((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Heslo
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(event) =>
                    setCredentials((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </label>
              {error ? <p className="admin-error">{error}</p> : null}
              <button type="submit" className="btn btn-primary" disabled={isLoggingIn}>
                {isLoggingIn ? "Přihlašuji..." : "Přihlásit se"}
                <Icon name="arrow-right" size={16} />
              </button>
            </form>
            <a href="#uvod" className="admin-back-link">
              <Icon name="chevron-left" size={16} />
              Zpět na web
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <section className="admin-panel">
        <header className="admin-header">
          <div>
            <span className="section-label">Neindexovaná správa</span>
            <h1>Obsah webu 2P Stavební</h1>
            <p>
              Správa je dostupná na adresách <strong>{ADMIN_PROJECTS_ROUTE}</strong> a{" "}
              <strong>{ADMIN_PROMOTIONS_ROUTE}</strong>. Obsah se ukládá do Firebase Realtime
              Database a veřejný web z ní data načítá.
            </p>
          </div>
          <div className="admin-actions">
            <a href="#uvod" className="btn btn-outline-dark">
              Zobrazit web
            </a>
            <button type="button" className="btn btn-dark" onClick={() => void signOut(auth)}>
              Odhlásit
            </button>
          </div>
        </header>

        <div className="admin-toolbar">
          <div className="admin-page-nav">
            <a
              href={ADMIN_PROJECTS_ROUTE}
              className={`admin-page-link ${currentSection === "projects" ? "active" : ""}`}
            >
              Projekty
            </a>
            <a
              href={ADMIN_PROMOTIONS_ROUTE}
              className={`admin-page-link ${currentSection === "promotions" ? "active" : ""}`}
            >
              Akce
            </a>
          </div>

          {currentSection === "promotions" ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  requestConfirmation({
                    title: "Uložit akce?",
                    message: "Tímto přepíšeš obsah promo akcí ve Firebase databázi.",
                    confirmLabel: isSavingPromotions ? "Ukládám..." : "Ano, uložit",
                    tone: "primary",
                    onConfirm: savePromotions,
                  })
                }
                disabled={isSavingPromotions}
              >
                {isSavingPromotions ? "Ukládám..." : "Uložit akce"}
                <Icon name="send" size={16} />
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetPromotionsToDefault}>
                Obnovit výchozí obsah
              </button>
            </>
          ) : (
            <p className="admin-inline-help">
              Každý projekt má vlastní změny. Po úpravě se přímo v jeho kartě ukáže `Uložit` a
              `Zrušit`.
            </p>
          )}

          {notice ? <p className="admin-notice">{notice}</p> : null}
          {currentSection === "promotions" && promotionsChanged ? (
            <p className="admin-dirty">Máš neuložené změny v akcích.</p>
          ) : null}
        </div>

        {currentSection === "projects" ? (
          <section className="admin-section admin-section-projects">
            <div className="admin-section-head">
              <div>
                <h2>Projekty a galerie</h2>
                <p>
                  U každého projektu spravuješ zvlášť texty i galerii. Obrázky nahráváš přímo do
                  Firebase Storage, pak je potvrdíš uložením konkrétní karty projektu.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const newEditor: ProjectEditor = {
                    editorId: createEditorId(),
                    savedSlug: null,
                    project: normalizeProject(createEmptyProject()),
                  };
                  setProjectEditors((current) => [newEditor, ...current]);
                  setOpenProjects((current) => [...current, newEditor.editorId]);
                }}
              >
                Přidat projekt
              </button>
            </div>

            <div className="admin-stack">
              {projectEditors.map((editor, editorIndex) => {
                const project = editor.project;
                const summary = getProjectSummary(project);
                const isOpen = openProjects.includes(editor.editorId);
                const isDirty = isProjectDirty(editor);
                const isSaving = savingProjectIds.includes(editor.editorId);

                return (
                  <article className="admin-card" key={editor.editorId}>
                    <div className="admin-card-head">
                      <button
                        type="button"
                        className="admin-card-toggle"
                        onClick={() => toggleProject(editor.editorId)}
                      >
                        <div>
                          <h3>{project.title || `Projekt ${editorIndex + 1}`}</h3>
                          <p className="admin-card-meta">
                            {project.location || "Bez lokality"} • {summary.total} obrázků •{" "}
                            {summary.visible} zobrazeno
                            {summary.hasPrimary ? " • hlavní obrázek zvolen" : ""}
                          </p>
                        </div>
                        <span className={`admin-chevron ${isOpen ? "open" : ""}`}>
                          <Icon name="chevron-right" size={18} />
                        </span>
                      </button>
                      <button
                        type="button"
                        className="admin-remove"
                        onClick={() =>
                          requestConfirmation({
                            title: "Odstranit projekt?",
                            message: `Projekt "${project.title || "Bez názvu"}" bude odstraněn z administrace i z databáze.`,
                            confirmLabel: "Ano, odstranit",
                            tone: "danger",
                            onConfirm: async () => {
                              await removeProjectImages(project.images);
                              const nextProjects = content.projects.items.filter(
                                (item) => item.slug !== editor.savedSlug,
                              );

                              if (editor.savedSlug) {
                                await saveManagedContentToFirebase({
                                  projects: nextProjects,
                                  promotions: promotionDraft,
                                });

                                onContentChange({
                                  ...content,
                                  projects: { ...content.projects, items: nextProjects },
                                  promotions: { items: promotionDraft },
                                });
                              }

                              setProjectEditors((current) =>
                                current.filter((item) => item.editorId !== editor.editorId),
                              );
                              setOpenProjects((current) =>
                                current.filter((item) => item !== editor.editorId),
                              );
                            },
                          })
                        }
                      >
                        Odstranit
                      </button>
                    </div>

                    {isOpen ? (
                      <>
                        <div className="admin-grid">
                          <label>
                            Slug
                            <input
                              type="text"
                              value={project.slug}
                              onChange={(event) =>
                                updateProjectEditor(editor.editorId, (current) => ({
                                  ...current,
                                  slug: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <label>
                            Kategorie
                            <input
                              type="text"
                              value={project.category}
                              onChange={(event) =>
                                updateProjectEditor(editor.editorId, (current) => ({
                                  ...current,
                                  category: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="admin-field-wide">
                            Název projektu
                            <input
                              type="text"
                              value={project.title}
                              onChange={(event) =>
                                updateProjectEditor(editor.editorId, (current) => ({
                                  ...current,
                                  title: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <label>
                            Lokalita
                            <input
                              type="text"
                              value={project.location ?? ""}
                              onChange={(event) =>
                                updateProjectEditor(editor.editorId, (current) => ({
                                  ...current,
                                  location: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="admin-field-wide">
                            Popis projektu
                            <textarea
                              value={project.summary}
                              onChange={(event) =>
                                updateProjectEditor(editor.editorId, (current) => ({
                                  ...current,
                                  summary: event.target.value,
                                }))
                              }
                            />
                          </label>
                        </div>

                        <div className="admin-subsection">
                          <div className="admin-subsection-head">
                            <div>
                              <h4>Galerie obrázků</h4>
                              <p className="admin-subsection-text">
                                Obrázky můžeš nahrát, označit jako hlavní, skrýt z webu nebo
                                nahradit novým souborem.
                              </p>
                            </div>
                            <label className="btn btn-secondary admin-file-trigger">
                              Přidat obrázek
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={async (event) => {
                                  const file = event.target.files?.[0];
                                  if (!file) return;

                                  const uploadKey = `${editor.editorId}-new-${Date.now()}`;
                                  setUploadingState(uploadKey, true);
                                  setNotice("");

                                  try {
                                    const uploaded = await uploadProjectImage(file, project.slug);
                                    updateProjectEditor(editor.editorId, (current) => ({
                                      ...current,
                                      images: [
                                        ...current.images,
                                        {
                                          ...uploaded,
                                          isPrimary:
                                            current.images.filter((image) => !image.hidden && image.src)
                                              .length === 0,
                                          hidden: false,
                                        },
                                      ],
                                    }));
                                    setNotice("Obrázek byl nahrán. Potvrď ho uložením projektu.");
                                    window.setTimeout(() => setNotice(""), 2500);
                                  } catch {
                                    setNotice("Nahrání obrázku se nepodařilo. Zkontroluj Firebase Storage.");
                                    window.setTimeout(() => setNotice(""), 4000);
                                  } finally {
                                    setUploadingState(uploadKey, false);
                                    event.target.value = "";
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <div className="admin-gallery-grid">
                            {project.images.map((image, imageIndex) => {
                              const uploadKey = `${editor.editorId}-${imageIndex}`;
                              return (
                                <article className="admin-gallery-tile" key={`${editor.editorId}-${imageIndex}`}>
                                  <div className="admin-gallery-frame">
                                    {image.src ? (
                                      <img
                                        src={image.src}
                                        alt={project.title || "Náhled obrázku"}
                                        className="admin-image-preview"
                                      />
                                    ) : (
                                      <div className="admin-image-placeholder">Bez obrázku</div>
                                    )}
                                    <div className="admin-gallery-badges">
                                      {image.isPrimary ? (
                                        <span className="admin-gallery-badge primary">Hlavní</span>
                                      ) : null}
                                      {image.hidden ? (
                                        <span className="admin-gallery-badge muted">Skrytý</span>
                                      ) : (
                                        <span className="admin-gallery-badge visible">Zobrazený</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="admin-gallery-actions">
                                    <button
                                      type="button"
                                      className="admin-icon-button"
                                      aria-label="Nastavit jako hlavní obrázek"
                                      onClick={() =>
                                        updateProjectEditor(editor.editorId, (current) => ({
                                          ...current,
                                          images: current.images.map((entry, entryIndex) => ({
                                            ...entry,
                                            hidden:
                                              entryIndex === imageIndex ? false : entry.hidden,
                                            isPrimary: entryIndex === imageIndex,
                                          })),
                                        }))
                                      }
                                    >
                                      <Icon name="star" size={16} />
                                    </button>

                                    <button
                                      type="button"
                                      className="admin-icon-button"
                                      aria-label={image.hidden ? "Zobrazit obrázek" : "Skrýt obrázek"}
                                      onClick={() =>
                                        updateProjectEditor(editor.editorId, (current) => ({
                                          ...current,
                                          images: current.images.map((entry, entryIndex) =>
                                            entryIndex === imageIndex
                                              ? { ...entry, hidden: !entry.hidden }
                                              : entry,
                                          ),
                                        }))
                                      }
                                    >
                                      <Icon name={image.hidden ? "eye" : "eye-off"} size={16} />
                                    </button>

                                    <button
                                      type="button"
                                      className="admin-icon-button"
                                      aria-label="Posunout obrázek doleva"
                                      disabled={imageIndex === 0}
                                      onClick={() =>
                                        updateProjectEditor(editor.editorId, (current) => ({
                                          ...current,
                                          images: moveItem(current.images, imageIndex, imageIndex - 1),
                                        }))
                                      }
                                    >
                                      <Icon name="chevron-left" size={16} />
                                    </button>

                                    <button
                                      type="button"
                                      className="admin-icon-button"
                                      aria-label="Posunout obrázek doprava"
                                      disabled={imageIndex === project.images.length - 1}
                                      onClick={() =>
                                        updateProjectEditor(editor.editorId, (current) => ({
                                          ...current,
                                          images: moveItem(current.images, imageIndex, imageIndex + 1),
                                        }))
                                      }
                                    >
                                      <Icon name="chevron-right" size={16} />
                                    </button>

                                    <label
                                      className={`admin-icon-button admin-file-trigger ${
                                        uploadingKeys.includes(uploadKey) ? "is-busy" : ""
                                      }`}
                                      aria-label="Nahrát novou verzi obrázku"
                                    >
                                      <Icon name="upload" size={16} />
                                      <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg,image/webp"
                                        onChange={async (event) => {
                                          const file = event.target.files?.[0];
                                          if (!file) return;

                                          setUploadingState(uploadKey, true);
                                          setNotice("");

                                          try {
                                            const uploaded = await uploadProjectImage(file, project.slug);
                                            updateProjectEditor(editor.editorId, (current) => ({
                                              ...current,
                                              images: current.images.map((entry, entryIndex) =>
                                                entryIndex === imageIndex
                                                  ? {
                                                      ...entry,
                                                      src: uploaded.src,
                                                      storagePath: uploaded.storagePath,
                                                    }
                                                  : entry,
                                              ),
                                            }));
                                            setNotice("Obrázek byl aktualizován. Potvrď ho uložením projektu.");
                                            window.setTimeout(() => setNotice(""), 2500);
                                          } catch {
                                            setNotice("Aktualizace obrázku se nepodařila.");
                                            window.setTimeout(() => setNotice(""), 4000);
                                          } finally {
                                            setUploadingState(uploadKey, false);
                                            event.target.value = "";
                                          }
                                        }}
                                      />
                                    </label>

                                    <button
                                      type="button"
                                      className="admin-icon-button danger"
                                      aria-label="Smazat obrázek"
                                      onClick={() =>
                                        requestConfirmation({
                                          title: "Odstranit obrázek?",
                                          message: "Vybraný obrázek bude odstraněn z galerie projektu.",
                                          confirmLabel: "Ano, odstranit",
                                          tone: "danger",
                                          onConfirm: async () => {
                                            if (project.images.length <= 1) {
                                              setNotice("Projekt musí mít alespoň jeden obrázek.");
                                              window.setTimeout(() => setNotice(""), 3000);
                                              return;
                                            }

                                            await removeProjectImage(image.storagePath);
                                            updateProjectEditor(editor.editorId, (current) => ({
                                              ...current,
                                              images: current.images.filter(
                                                (_, entryIndex) => entryIndex !== imageIndex,
                                              ),
                                            }));
                                          },
                                        })
                                      }
                                    >
                                      <Icon name="trash" size={16} />
                                    </button>
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        </div>

                        {isDirty ? (
                          <div className="admin-project-savebar">
                            <p className="admin-dirty">V tomhle projektu máš neuložené změny.</p>
                            <div className="admin-project-save-actions">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() =>
                                  requestConfirmation({
                                    title: "Zrušit změny?",
                                    message:
                                      "Vrátí se poslední uložený stav projektu a zahodí se lokální úpravy.",
                                    confirmLabel: "Ano, zrušit změny",
                                    tone: "danger",
                                    onConfirm: () => cancelProjectChanges(editor),
                                  })
                                }
                              >
                                Zrušit změny
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                disabled={isSaving}
                                onClick={() =>
                                  requestConfirmation({
                                    title: "Uložit projekt?",
                                    message:
                                      "Tímto uložíš texty i galerii tohoto projektu do Firebase databáze.",
                                    confirmLabel: isSaving ? "Ukládám..." : "Ano, uložit projekt",
                                    tone: "primary",
                                    onConfirm: () => saveProjectChanges(editor),
                                  })
                                }
                              >
                                {isSaving ? "Ukládám..." : "Uložit projekt"}
                                <Icon name="send" size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="admin-project-savebar is-clean">
                            <p className="admin-clean">Projekt je uložený a bez lokálních změn.</p>
                          </div>
                        )}
                      </>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {currentSection === "promotions" ? (
          <section className="admin-section admin-section-promotions">
            <div className="admin-section-head">
              <div>
                <h2>Promo akce a události</h2>
                <p>
                  Zde nastavíš popup akce. Zobrazí se první aktivní akce v seznamu, která spadá do
                  aktuálního období.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const newPromotion = createEmptyPromotion();
                  setPromotionDraft((current) => [newPromotion, ...current]);
                  setOpenPromotions((current) => [...current, newPromotion.id]);
                }}
              >
                Přidat akci
              </button>
            </div>

            <div className="admin-stack">
              {promotionDraft.map((promotion, promotionIndex) => (
                <article className="admin-card" key={promotion.id}>
                  <div className="admin-card-head">
                    <button
                      type="button"
                      className="admin-card-toggle"
                      onClick={() => togglePromotion(promotion.id)}
                    >
                      <div>
                        <h3>{promotion.title || `Akce ${promotionIndex + 1}`}</h3>
                        <p className="admin-card-meta">
                          {promotion.enabled ? "Aktivní" : "Neaktivní"} •{" "}
                          {promotion.startsAt || "bez začátku"} až {promotion.endsAt || "bez konce"}
                        </p>
                      </div>
                      <span className={`admin-chevron ${openPromotions.includes(promotion.id) ? "open" : ""}`}>
                        <Icon name="chevron-right" size={18} />
                      </span>
                    </button>
                    <button
                      type="button"
                      className="admin-remove"
                      onClick={() =>
                        requestConfirmation({
                          title: "Odstranit akci?",
                          message: `Akce "${promotion.title || "Bez názvu"}" bude odstraněna z administrace.`,
                          confirmLabel: "Ano, odstranit",
                          tone: "danger",
                          onConfirm: () => {
                            setPromotionDraft((current) =>
                              current.filter((_, index) => index !== promotionIndex),
                            );
                            setOpenPromotions((current) =>
                              current.filter((item) => item !== promotion.id),
                            );
                          },
                        })
                      }
                    >
                      Odstranit
                    </button>
                  </div>

                  {openPromotions.includes(promotion.id) ? (
                    <div className="admin-grid">
                      <label>
                        ID akce
                        <input
                          type="text"
                          value={promotion.id}
                          onChange={(event) =>
                            setPromotionDraft((current) =>
                              current.map((item, index) =>
                                index === promotionIndex
                                  ? { ...item, id: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="admin-checkbox">
                        <span>Akce je aktivní</span>
                        <input
                          type="checkbox"
                          checked={promotion.enabled}
                          onChange={(event) =>
                            setPromotionDraft((current) =>
                              current.map((item, index) =>
                                index === promotionIndex
                                  ? { ...item, enabled: event.target.checked }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Badge
                        <input
                          type="text"
                          value={promotion.badge}
                          onChange={(event) =>
                            setPromotionDraft((current) =>
                              current.map((item, index) =>
                                index === promotionIndex
                                  ? { ...item, badge: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="admin-field-wide">
                        Nadpis akce
                        <input
                          type="text"
                          value={promotion.title}
                          onChange={(event) =>
                            setPromotionDraft((current) =>
                              current.map((item, index) =>
                                index === promotionIndex
                                  ? { ...item, title: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Začátek
                        <input
                          type="date"
                          value={promotion.startsAt ?? ""}
                          onChange={(event) =>
                            setPromotionDraft((current) =>
                              current.map((item, index) =>
                                index === promotionIndex
                                  ? { ...item, startsAt: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Konec
                        <input
                          type="date"
                          value={promotion.endsAt ?? ""}
                          onChange={(event) =>
                            setPromotionDraft((current) =>
                              current.map((item, index) =>
                                index === promotionIndex
                                  ? { ...item, endsAt: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                      <label className="admin-field-wide">
                        Text popupu
                        <textarea
                          value={promotion.text}
                          onChange={(event) =>
                            setPromotionDraft((current) =>
                              current.map((item, index) =>
                                index === promotionIndex
                                  ? { ...item, text: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Text tlačítka
                        <input
                          type="text"
                          value={promotion.ctaLabel}
                          onChange={(event) =>
                            setPromotionDraft((current) =>
                              current.map((item, index) =>
                                index === promotionIndex
                                  ? { ...item, ctaLabel: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                      <label>
                        Odkaz tlačítka
                        <input
                          type="text"
                          value={promotion.ctaHref}
                          onChange={(event) =>
                            setPromotionDraft((current) =>
                              current.map((item, index) =>
                                index === promotionIndex
                                  ? { ...item, ctaHref: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
      {confirmState ? (
        <div className="admin-confirm-backdrop" onClick={() => setConfirmState(null)}>
          <div className="admin-confirm-dialog" onClick={(event) => event.stopPropagation()}>
            <span className="section-label">Potvrzení akce</span>
            <h2>{confirmState.title}</h2>
            <p>{confirmState.message}</p>
            <div className="admin-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmState(null)}
              >
                Zrušit
              </button>
              <button
                type="button"
                className={`btn ${confirmState.tone === "danger" ? "btn-danger" : "btn-primary"}`}
                onClick={async () => {
                  const action = confirmState.onConfirm;
                  setConfirmState(null);
                  await action();
                }}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

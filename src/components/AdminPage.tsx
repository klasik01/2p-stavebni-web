import { useMemo, useState } from "react";
import type { ManagedContent, Project, Promotion, SiteContent } from "../types/content";
import {
  ADMIN_ROUTE,
  ADMIN_PROJECTS_ROUTE,
  ADMIN_PROMOTIONS_ROUTE,
  clearManagedContent,
  isAdminSessionActive,
  saveManagedContentToFirebase,
  setAdminSession,
} from "../utils/contentStorage";
import { removeProjectImage, uploadProjectImage } from "../utils/storage";
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

function createEmptyProject(): Project {
  return {
    slug: `projekt-${Date.now()}`,
    category: "Realizované zakázky",
    title: "Nový projekt",
    summary: "",
    location: "",
    images: [{ src: "", alt: "" }],
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
    projects: content.projects.items.map((project) => ({
      ...project,
      images: project.images.map((image) => ({ ...image })),
    })),
    promotions: content.promotions.items.map((promotion) => ({ ...promotion })),
  };
}

export function AdminPage({
  content,
  defaultContent,
  onContentChange,
  currentSection,
}: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminSessionActive());
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<ManagedContent>(() => cloneManagedContent(content));
  const [openProjects, setOpenProjects] = useState<string[]>([]);
  const [openPromotions, setOpenPromotions] = useState<string[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [uploadingKeys, setUploadingKeys] = useState<string[]>([]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(draft) !== JSON.stringify(cloneManagedContent(content));
  }, [content, draft]);

  const saveDraft = async () => {
    setIsSaving(true);

    try {
      await saveManagedContentToFirebase(draft);
      onContentChange({
        ...content,
        projects: { ...content.projects, items: draft.projects },
        promotions: { items: draft.promotions },
      });
      setNotice("Změny byly uloženy do Firebase databáze.");
      window.setTimeout(() => setNotice(""), 3000);
    } catch {
      setNotice("Uložení do Firebase se nepodařilo. Zkontroluj pravidla databáze.");
      window.setTimeout(() => setNotice(""), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const requestConfirmation = (state: ConfirmState) => {
    setConfirmState(state);
  };

  const setUploadingState = (key: string, isActive: boolean) => {
    setUploadingKeys((current) =>
      isActive ? [...new Set([...current, key])] : current.filter((item) => item !== key),
    );
  };

  const resetToDefault = () => {
    clearManagedContent();
    onContentChange(defaultContent);
    setDraft(cloneManagedContent(defaultContent));
    setOpenProjects([]);
    setOpenPromotions([]);
    setNotice("Obsah byl vrácen na výchozí hodnoty z projektu.");
    window.setTimeout(() => setNotice(""), 3000);
  };

  const toggleProject = (slug: string) => {
    setOpenProjects((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  };

  const togglePromotion = (id: string) => {
    setOpenPromotions((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  if (!isAuthenticated) {
    return (
      <main className="admin-shell">
        <section className="admin-login">
          <div className="admin-login-card">
            <span className="section-label">Neveřejná správa</span>
            <h1>Administrace obsahu</h1>
            <p>
              Tato stránka je určená pro interní správu projektů a promo akcí. Prozatím je
              přihlášení nastavené pouze dočasně.
            </p>
            <form
              className="admin-login-form"
              onSubmit={(event) => {
                event.preventDefault();

                if (
                  credentials.username === "admin" &&
                  credentials.password === "admin"
                ) {
                  setAdminSession(true);
                  setIsAuthenticated(true);
                  setError("");
                  return;
                }

                setError("Neplatné přihlášení. Zatím funguje pouze admin / admin.");
              }}
            >
              <label>
                Uživatelské jméno
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(event) =>
                    setCredentials((current) => ({
                      ...current,
                      username: event.target.value,
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
              <button type="submit" className="btn btn-primary">
                Přihlásit se
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
            <button
              type="button"
              className="btn btn-dark"
              onClick={() => {
                setAdminSession(false);
                setIsAuthenticated(false);
              }}
            >
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
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              requestConfirmation({
                title: "Uložit změny?",
                message:
                  "Tímto přepíšeš obsah projektů a promo akcí ve Firebase databázi.",
                confirmLabel: isSaving ? "Ukládám..." : "Ano, uložit",
                tone: "primary",
                onConfirm: saveDraft,
              })
            }
            disabled={isSaving}
          >
            {isSaving ? "Ukládám..." : "Uložit změny"}
            <Icon name="send" size={16} />
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetToDefault}>
            Obnovit výchozí obsah
          </button>
          {notice ? <p className="admin-notice">{notice}</p> : null}
          {hasChanges ? <p className="admin-dirty">Máš neuložené změny.</p> : null}
        </div>

        {currentSection === "projects" ? (
        <section className="admin-section admin-section-projects">
          <div className="admin-section-head">
            <div>
              <h2>Projekty a galerie</h2>
              <p>
                Tady upravíš seznam realizací, texty, lokaci i galerie obrázků. První obrázek je
                použitý jako hlavní náhled v referencích.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const newProject = createEmptyProject();
                setDraft((current) => ({
                  ...current,
                  projects: [newProject, ...current.projects],
                }));
                setOpenProjects((current) => [...current, newProject.slug]);
              }}
            >
              Přidat projekt
            </button>
          </div>

          <div className="admin-stack">
            {draft.projects.map((project, projectIndex) => (
              <article className="admin-card" key={project.slug}>
                <div className="admin-card-head">
                  <button
                    type="button"
                    className="admin-card-toggle"
                    onClick={() => toggleProject(project.slug)}
                  >
                    <div>
                      <h3>{project.title || `Projekt ${projectIndex + 1}`}</h3>
                      <p className="admin-card-meta">
                        {project.location || "Bez lokality"} • {project.images.length} obrázků
                      </p>
                    </div>
                    <span className={`admin-chevron ${openProjects.includes(project.slug) ? "open" : ""}`}>
                      <Icon name="chevron-right" size={18} />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="admin-remove"
                    onClick={() =>
                      requestConfirmation({
                        title: "Odstranit projekt?",
                        message: `Projekt "${project.title || "Bez názvu"}" bude odstraněn z administrace.`,
                        confirmLabel: "Ano, odstranit",
                        tone: "danger",
                        onConfirm: () => {
                          setDraft((current) => ({
                            ...current,
                            projects: current.projects.filter((_, index) => index !== projectIndex),
                          }));
                          setOpenProjects((current) =>
                            current.filter((item) => item !== project.slug),
                          );
                        },
                      })
                    }
                  >
                    Odstranit
                  </button>
                </div>

                {openProjects.includes(project.slug) ? (
                  <>
                <div className="admin-grid">
                  <label>
                    Slug
                    <input
                      type="text"
                      value={project.slug}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          projects: current.projects.map((item, index) =>
                            index === projectIndex
                              ? { ...item, slug: event.target.value }
                              : item,
                          ),
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
                        setDraft((current) => ({
                          ...current,
                          projects: current.projects.map((item, index) =>
                            index === projectIndex
                              ? { ...item, category: event.target.value }
                              : item,
                          ),
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
                        setDraft((current) => ({
                          ...current,
                          projects: current.projects.map((item, index) =>
                            index === projectIndex
                              ? { ...item, title: event.target.value }
                              : item,
                          ),
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
                        setDraft((current) => ({
                          ...current,
                          projects: current.projects.map((item, index) =>
                            index === projectIndex
                              ? { ...item, location: event.target.value }
                              : item,
                          ),
                        }))
                      }
                    />
                  </label>
                  <label className="admin-field-wide">
                    Popis projektu
                    <textarea
                      value={project.summary}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          projects: current.projects.map((item, index) =>
                            index === projectIndex
                              ? { ...item, summary: event.target.value }
                              : item,
                          ),
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="admin-subsection">
                  <div className="admin-subsection-head">
                    <h4>Galerie obrázků</h4>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          projects: current.projects.map((item, index) =>
                            index === projectIndex
                              ? {
                                  ...item,
                                  images: [...item.images, { src: "", alt: "", storagePath: "" }],
                                }
                              : item,
                          ),
                        }))
                      }
                    >
                      Přidat obrázek
                    </button>
                  </div>

                  <div className="admin-stack compact">
                    {project.images.map((image, imageIndex) => (
                      <div className="admin-image-row" key={`${project.slug}-${imageIndex}`}>
                        <label>
                          URL obrázku
                          <input
                            type="text"
                            value={image.src}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                projects: current.projects.map((item, index) =>
                                  index === projectIndex
                                    ? {
                                        ...item,
                                        images: item.images.map((entry, entryIndex) =>
                                          entryIndex === imageIndex
                                            ? { ...entry, src: event.target.value }
                                            : entry,
                                        ),
                                      }
                                    : item,
                                ),
                              }))
                            }
                          />
                        </label>
                        <label>
                          Alt text
                          <input
                            type="text"
                            value={image.alt}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                projects: current.projects.map((item, index) =>
                                  index === projectIndex
                                    ? {
                                        ...item,
                                        images: item.images.map((entry, entryIndex) =>
                                          entryIndex === imageIndex
                                            ? { ...entry, alt: event.target.value }
                                            : entry,
                                        ),
                                      }
                                    : item,
                                ),
                              }))
                            }
                          />
                        </label>
                        <div className="admin-upload-tools">
                          {image.src ? (
                            <img
                              src={image.src}
                              alt={image.alt || "Náhled obrázku"}
                              className="admin-image-preview"
                            />
                          ) : (
                            <div className="admin-image-placeholder">Bez obrázku</div>
                          )}
                          <label className="admin-upload-button">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              onChange={async (event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;

                                const uploadKey = `${project.slug}-${imageIndex}`;
                                setUploadingState(uploadKey, true);
                                setNotice("");

                                try {
                                  const uploaded = await uploadProjectImage(file, project.slug);
                                  setDraft((current) => ({
                                    ...current,
                                    projects: current.projects.map((item, index) =>
                                      index === projectIndex
                                        ? {
                                            ...item,
                                            images: item.images.map((entry, entryIndex) =>
                                              entryIndex === imageIndex
                                                ? {
                                                    ...entry,
                                                    src: uploaded.src,
                                                    alt: entry.alt || uploaded.alt,
                                                    storagePath: uploaded.storagePath,
                                                  }
                                                : entry,
                                            ),
                                          }
                                        : item,
                                    ),
                                  }));
                                  setNotice("Obrázek byl nahrán do Firebase Storage.");
                                  window.setTimeout(() => setNotice(""), 2500);
                                } catch {
                                  setNotice("Nahrání obrázku se nepodařilo. Zkontroluj pravidla Firebase Storage.");
                                  window.setTimeout(() => setNotice(""), 4000);
                                } finally {
                                  setUploadingState(uploadKey, false);
                                  event.target.value = "";
                                }
                              }}
                            />
                            {uploadingKeys.includes(`${project.slug}-${imageIndex}`)
                              ? "Nahrávám..."
                              : "Vybrat soubor"}
                          </label>
                        </div>
                        <button
                          type="button"
                          className="admin-remove"
                          onClick={() =>
                            requestConfirmation({
                              title: "Odstranit obrázek?",
                              message: "Vybraný obrázek bude odstraněn z galerie projektu.",
                              confirmLabel: "Ano, odstranit",
                              tone: "danger",
                              onConfirm: async () => {
                                await removeProjectImage(image.storagePath);
                                setDraft((current) => ({
                                  ...current,
                                  projects: current.projects.map((item, index) =>
                                    index === projectIndex
                                      ? {
                                          ...item,
                                          images: item.images.filter(
                                            (_, entryIndex) => entryIndex !== imageIndex,
                                          ),
                                        }
                                      : item,
                                  ),
                                }));
                              },
                            })
                          }
                        >
                          Smazat
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                  </>
                ) : null}
              </article>
            ))}
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
                setDraft((current) => ({
                  ...current,
                  promotions: [newPromotion, ...current.promotions],
                }));
                setOpenPromotions((current) => [...current, newPromotion.id]);
              }}
            >
              Přidat akci
            </button>
          </div>

          <div className="admin-stack">
            {draft.promotions.map((promotion, promotionIndex) => (
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
                          setDraft((current) => ({
                            ...current,
                            promotions: current.promotions.filter(
                              (_, index) => index !== promotionIndex,
                            ),
                          }));
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
                        setDraft((current) => ({
                          ...current,
                          promotions: current.promotions.map((item, index) =>
                            index === promotionIndex
                              ? { ...item, id: event.target.value }
                              : item,
                          ),
                        }))
                      }
                    />
                  </label>
                  <label className="admin-checkbox">
                    <span>Akce je aktivní</span>
                    <input
                      type="checkbox"
                      checked={promotion.enabled}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          promotions: current.promotions.map((item, index) =>
                            index === promotionIndex
                              ? { ...item, enabled: event.target.checked }
                              : item,
                          ),
                        }))
                      }
                    />
                  </label>
                  <label>
                    Badge
                    <input
                      type="text"
                      value={promotion.badge}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          promotions: current.promotions.map((item, index) =>
                            index === promotionIndex
                              ? { ...item, badge: event.target.value }
                              : item,
                          ),
                        }))
                      }
                    />
                  </label>
                  <label className="admin-field-wide">
                    Nadpis akce
                    <input
                      type="text"
                      value={promotion.title}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          promotions: current.promotions.map((item, index) =>
                            index === promotionIndex
                              ? { ...item, title: event.target.value }
                              : item,
                          ),
                        }))
                      }
                    />
                  </label>
                  <label>
                    Začátek
                    <input
                      type="date"
                      value={promotion.startsAt ?? ""}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          promotions: current.promotions.map((item, index) =>
                            index === promotionIndex
                              ? { ...item, startsAt: event.target.value }
                              : item,
                          ),
                        }))
                      }
                    />
                  </label>
                  <label>
                    Konec
                    <input
                      type="date"
                      value={promotion.endsAt ?? ""}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          promotions: current.promotions.map((item, index) =>
                            index === promotionIndex
                              ? { ...item, endsAt: event.target.value }
                              : item,
                          ),
                        }))
                      }
                    />
                  </label>
                  <label className="admin-field-wide">
                    Text popupu
                    <textarea
                      value={promotion.text}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          promotions: current.promotions.map((item, index) =>
                            index === promotionIndex
                              ? { ...item, text: event.target.value }
                              : item,
                          ),
                        }))
                      }
                    />
                  </label>
                  <label>
                    Text tlačítka
                    <input
                      type="text"
                      value={promotion.ctaLabel}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          promotions: current.promotions.map((item, index) =>
                            index === promotionIndex
                              ? { ...item, ctaLabel: event.target.value }
                              : item,
                          ),
                        }))
                      }
                    />
                  </label>
                  <label>
                    Odkaz tlačítka
                    <input
                      type="text"
                      value={promotion.ctaHref}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          promotions: current.promotions.map((item, index) =>
                            index === promotionIndex
                              ? { ...item, ctaHref: event.target.value }
                              : item,
                          ),
                        }))
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

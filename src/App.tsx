import { useEffect, useMemo, useState } from "react";
import { AdminPage } from "./components/AdminPage";
import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";
import { DiarySection } from "./components/DiarySection";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { Navbar } from "./components/Navbar";
import { ProjectModal } from "./components/ProjectModal";
import { ProjectsSection } from "./components/ProjectsSection";
import { PromoPopup } from "./components/PromoPopup";
import { ServicesSection } from "./components/ServicesSection";
import { TrustBar } from "./components/TrustBar";
import { siteContent } from "./content/siteContent";
import type { Project } from "./types/content";
import {
  ADMIN_ROUTE,
  ADMIN_PROJECTS_ROUTE,
  ADMIN_PROMOTIONS_ROUTE,
  loadManagedContent,
  loadManagedContentFromFirebase,
} from "./utils/contentStorage";

function App() {
  const [content, setContent] = useState(() => loadManagedContent(siteContent));
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [route, setRoute] = useState(() => window.location.hash || "#uvod");
  const [isContentLoading, setIsContentLoading] = useState(true);
  const isAdminRoute = route.startsWith(ADMIN_ROUTE);
  const adminSection = route.startsWith(ADMIN_PROMOTIONS_ROUTE)
    ? "promotions"
    : "projects";

  const activePromotions = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return content.promotions.items.filter((promotion) => {
      if (!promotion.enabled) return false;
      if (promotion.startsAt && today < promotion.startsAt) return false;
      if (promotion.endsAt && today > promotion.endsAt) return false;
      return true;
    });
  }, [content.promotions.items]);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || "#uvod");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    let active = true;

    loadManagedContentFromFirebase(siteContent).then((resolvedContent) => {
      if (!active) return;
      setContent(resolvedContent);
      setIsContentLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.title = isAdminRoute ? "Administrace | 2P Stavební" : content.seo.title;

    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }

    robots.setAttribute("content", isAdminRoute ? "noindex, nofollow" : "index, follow");
  }, [content.seo.title, isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute) return;

    const reveals = document.querySelectorAll<HTMLElement>(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (!entry.isIntersecting) return;

          window.setTimeout(() => {
            entry.target.classList.add("visible");
          }, index * 80);

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );

    reveals.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [content, isAdminRoute]);

  if (isAdminRoute) {
    return (
      <AdminPage
        content={content}
        defaultContent={siteContent}
        onContentChange={setContent}
        currentSection={adminSection}
      />
    );
  }

  if (isContentLoading) {
    return (
      <main className="admin-shell">
        <section className="admin-login">
          <div className="admin-login-card">
            <span className="section-label">Načítání obsahu</span>
            <h1>Načítám data z Firebase</h1>
            <p>Jakmile budou data připravená, zobrazí se veřejný web i administrace.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <Navbar
        companyName={content.company.name}
        logo={content.company.logos.light}
        navigation={content.navigation}
      />
      <main>
        <HeroSection content={content.hero} />
        <TrustBar items={content.trustBar} />
        <ServicesSection content={content.services} />
        <AboutSection content={content.about} />
        <ProjectsSection
          content={content.projects}
          onProjectOpen={setSelectedProject}
        />
        <DiarySection content={content.diary} />
        <ContactSection content={content.contact} />
      </main>
      <Footer
        content={content.footer}
        navigation={content.navigation}
        logo={content.company.logos.light}
      />
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <PromoPopup items={activePromotions} />
    </>
  );
}

export default App;

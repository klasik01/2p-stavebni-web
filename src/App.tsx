import { useEffect, useMemo, useState } from "react";
import { AdminPage } from "./components/AdminPage";
import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";
import { CookieConsentBanner } from "./components/CookieConsentBanner";
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
import { initAnalytics, disableAnalytics, trackPageView } from "./utils/analytics";
import { getCookieConsent, setCookieConsent, type CookieConsentState } from "./utils/cookieConsent";
import { getHeroProjectImages } from "./utils/projectImages";
import {
  ADMIN_ROUTE,
  ADMIN_PROJECTS_ROUTE,
  ADMIN_PROMOTIONS_ROUTE,
  subscribeManagedContentFromFirebase,
} from "./utils/contentStorage";

function App() {
  const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const [content, setContent] = useState(siteContent);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [route, setRoute] = useState(() => window.location.hash || "#uvod");
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [cookieConsent, setCookieConsentState] = useState<CookieConsentState>(() =>
    getCookieConsent(),
  );
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

  const heroBackgroundImages = useMemo(
    () => getHeroProjectImages(content.projects.items).map((image) => image.src),
    [content.projects.items],
  );

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || "#uvod");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeManagedContentFromFirebase(
      siteContent,
      (resolvedContent) => {
        setContent(resolvedContent);
        setIsContentLoading(false);
      },
      () => {
        setContent(siteContent);
        setIsContentLoading(false);
      },
    );

    return () => {
      unsubscribe();
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
    if (!gaMeasurementId) return;

    if (cookieConsent === "accepted") {
      initAnalytics(gaMeasurementId);
      return;
    }

    disableAnalytics(gaMeasurementId);
  }, [cookieConsent, gaMeasurementId]);

  useEffect(() => {
    if (cookieConsent !== "accepted" || !gaMeasurementId) return;

    const pagePath = `${window.location.pathname}${window.location.hash || ""}`;
    const pageTitle = isAdminRoute ? "Administrace | 2P Stavební" : content.seo.title;
    trackPageView(gaMeasurementId, pagePath, pageTitle);
  }, [content.seo.title, cookieConsent, gaMeasurementId, isAdminRoute, route]);

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
            <img
              src={siteContent.company.logos.color}
              alt="2P Stavební"
              className="hero-brand-logo"
            />
            <span className="section-label">Chvilka strpení</span>
            <h1>Načítáme pro vás obsah</h1>
            <p>Stránka se právě připravuje, za okamžik bude vše k dispozici.</p>
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
        <HeroSection content={content.hero} backgroundImages={heroBackgroundImages} />
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
      {cookieConsent === "unset" && gaMeasurementId ? (
        <CookieConsentBanner
          onAccept={() => {
            setCookieConsent("accepted");
            setCookieConsentState("accepted");
          }}
          onReject={() => {
            setCookieConsent("rejected");
            setCookieConsentState("rejected");
          }}
        />
      ) : null}
    </>
  );
}

export default App;

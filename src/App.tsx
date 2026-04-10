import { useEffect, useMemo, useState } from "react";
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

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const activePromotions = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return siteContent.promotions.items.filter((promotion) => {
      if (!promotion.enabled) return false;
      if (promotion.startsAt && today < promotion.startsAt) return false;
      if (promotion.endsAt && today > promotion.endsAt) return false;
      return true;
    });
  }, []);

  useEffect(() => {
    document.title = siteContent.seo.title;
  }, []);

  useEffect(() => {
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
  }, []);

  return (
    <>
      <Navbar companyName={siteContent.company.name} navigation={siteContent.navigation} />
      <main>
        <HeroSection content={siteContent.hero} />
        <TrustBar items={siteContent.trustBar} />
        <ServicesSection content={siteContent.services} />
        <AboutSection content={siteContent.about} />
        <ProjectsSection
          content={siteContent.projects}
          onProjectOpen={setSelectedProject}
        />
        <DiarySection content={siteContent.diary} />
        <ContactSection content={siteContent.contact} />
      </main>
      <Footer content={siteContent.footer} navigation={siteContent.navigation} />
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <PromoPopup items={activePromotions} />
    </>
  );
}

export default App;

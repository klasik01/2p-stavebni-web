import { company } from "../company";
import { contacts } from "../contacts";
import { legal } from "../legal";
import { services as servicesData } from "../pages/home/services";
import { socials } from "../socials";
import { CONTACT_PHONE_RAW, SITE_URL } from "./defaults";
import { faq } from "./faq";

/**
 * All JSON-LD builders. They return plain JS objects – the SEOHead component
 * serializes them. Keep business facts DRY by composing from the shared
 * data modules (company, contacts, legal, socials).
 */

type JsonLd = Record<string, unknown>;

const addressSchema = {
  "@type": "PostalAddress",
  streetAddress: contacts.addresses.registered.street,
  addressLocality: contacts.addresses.registered.city,
  postalCode: contacts.addresses.registered.postalCode,
  addressCountry: contacts.addresses.registered.country,
};

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: company.legalName,
    alternateName: company.name,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/assets/images/logo.png`,
    telephone: CONTACT_PHONE_RAW,
    email: contacts.email,
    address: addressSchema,
    taxID: legal.dic,
    vatID: legal.dic,
    sameAs: socials.map((social) => social.href),
  };
}

export function localBusinessSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "GeneralContractor"],
    "@id": `${SITE_URL}/#localbusiness`,
    name: company.legalName,
    alternateName: company.name,
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/assets/images/projects/6/1.jpg`,
    logo: `${SITE_URL}/assets/images/logo.png`,
    telephone: CONTACT_PHONE_RAW,
    email: contacts.email,
    priceRange: "$$",
    address: addressSchema,
    areaServed: [
      { "@type": "AdministrativeArea", name: "Kraj Vysočina" },
      { "@type": "City", name: "Pacov" },
      { "@type": "City", name: "Pelhřimov" },
      { "@type": "City", name: "Humpolec" },
    ],
    sameAs: socials.map((social) => social.href),
    makesOffer: servicesData.items.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.title,
        description: service.description,
      },
    })),
  };
}

export function websiteSchema(title: string, description: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: title,
    description,
    inLanguage: "cs-CZ",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

export function speakableSchema(cssSelectors: string[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SpeakableSpecification",
    cssSelector: cssSelectors,
  };
}

/** Aggregate all JSON-LD blocks meant to be injected on the home page. */
export function homeJsonLdBlocks(title: string, description: string): JsonLd[] {
  return [
    organizationSchema(),
    localBusinessSchema(),
    websiteSchema(title, description),
    breadcrumbSchema([{ name: "Úvod", url: `${SITE_URL}/` }]),
    faqSchema(),
  ];
}

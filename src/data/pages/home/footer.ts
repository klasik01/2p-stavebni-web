import type { FooterContent } from "../../../types/content";
import { contacts, registeredAddressLine } from "../../contacts";
import { footerLegalLine } from "../../legal";
import { socials } from "../../socials";

export const footer: FooterContent = {
  description:
    "Stavíme s vášní a zodpovědností. Přinášíme inovativní řešení, která překračují očekávání investorů.",
  phone: contacts.phone,
  email: contacts.email,
  address: registeredAddressLine,
  copyright: "© 2026 2P Stavební s.r.o. Všechna práva vyhrazena.",
  legal: footerLegalLine,
  socials: [...socials],
};

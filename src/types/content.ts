export type NavItem = {
  label: string;
  href: string;
  isButton?: boolean;
};

export type Stat = {
  value: number;
  suffix?: string;
  label: string;
};

export type HeroContent = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  backgroundImage: string;
  primaryAction: NavItem;
  secondaryAction: NavItem;
  stats: Stat[];
};

export type TrustItem = {
  text: string;
};

export type Service = {
  title: string;
  description: string;
  icon: string;
};

export type ServicesContent = {
  label: string;
  title: string;
  titleAccent: string;
  description: string;
  items: Service[];
};

export type AboutContent = {
  label: string;
  title: string;
  titleAccent: string;
  paragraphs: string[];
  mainImage: string;
  accentImage: string;
  badgeValue: string;
  badgeText: string;
  features: string[];
  action: NavItem;
};

export type ProjectImage = {
  src: string;
  alt: string;
  storagePath?: string;
};

export type Project = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  location?: string;
  images: ProjectImage[];
};

export type ProjectsContent = {
  label: string;
  title: string;
  titleAccent: string;
  description: string;
  items: Project[];
};

export type DiaryContent = {
  label: string;
  title: string;
  description: string;
  action: NavItem;
};

export type TeamMember = {
  name: string;
  role: string;
  phone: string;
  email: string;
  initials: string;
};

export type ContactContent = {
  label: string;
  title: string;
  titleAccent: string;
  description: string;
  companyLines: string[];
  officeLines: string[];
  registration: string;
  phone: string;
  email: string;
  team: TeamMember[];
};

export type FooterContent = {
  description: string;
  phone: string;
  email: string;
  address: string;
  copyright: string;
  legal: string;
  socials: { label: string; href: string; icon: string }[];
};

export type Promotion = {
  id: string;
  enabled: boolean;
  startsAt?: string;
  endsAt?: string;
  badge: string;
  title: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
};

export type SiteContent = {
  seo: {
    title: string;
    description: string;
  };
  company: {
    name: string;
    logo: string;
  };
  navigation: NavItem[];
  hero: HeroContent;
  trustBar: TrustItem[];
  services: ServicesContent;
  about: AboutContent;
  projects: ProjectsContent;
  diary: DiaryContent;
  contact: ContactContent;
  footer: FooterContent;
  promotions: {
    items: Promotion[];
  };
};

export type ManagedContent = {
  projects: Project[];
  promotions: Promotion[];
};

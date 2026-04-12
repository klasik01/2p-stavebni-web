import type { SiteContent } from "../types/content";

export const siteContent: SiteContent = {
  seo: {
    title: "2P Stavební | Kvalitní a efektivní provádění staveb",
    description:
      "2P Stavební s.r.o. – kompletní realizace pozemních staveb, inženýrská činnost, montáž výplní otvorů a požárních ucpávek.",
  },
  company: {
    name: "2P Stavební",
    logos: {
      light: "https://2pstavebni.cz/assets/images/logo-01.png",
      color: "https://2pstavebni.cz/assets/images/logo-02.png",
    },
  },
  navigation: [
    { label: "Úvod", href: "#uvod" },
    { label: "Služby", href: "#sluzby" },
    { label: "O nás", href: "#o-nas" },
    { label: "Reference", href: "#reference" },
    { label: "Kontakt", href: "#kontakt", isButton: true },
  ],
  hero: {
    eyebrow: "Stavební firma Pacov",
    title: "Kvalitní a efektivní",
    titleAccent: "provádění staveb",
    description:
      "Stojíme za každým projektem. Od rodinných domů po rekonstrukce veřejných budov – přinášíme řešení nejvyšší kvality s plnou transparentností.",
    backgroundImage: "https://2pstavebni.cz/assets/images/projects/6/1.jpg",
    brandLogo: "https://2pstavebni.cz/assets/images/logo-02.png",
    primaryAction: { label: "Naše reference", href: "#reference" },
    secondaryAction: { label: "Kontaktujte nás", href: "#kontakt" },
    stats: [
      { value: 15, suffix: "+", label: "Let zkušeností" },
      { value: 25, label: "Realizovaných projektů" },
      { value: 24, suffix: "/7", label: "Přehled o stavbě" },
    ],
  },
  trustBar: [
    { text: "Elektronický stavební deník" },
    { text: "Transparentní komunikace" },
    { text: "Komplexní dodávka od A do Z" },
    { text: "Certifikovaní odborníci" },
  ],
  services: {
    label: "Co děláme",
    title: "Jaké služby",
    titleAccent: "nabízíme?",
    description:
      "Pokrýváme celé spektrum stavebních činností – od komplexní realizace až po odborné poradenství a koordinaci projektů.",
    items: [
      {
        title: "Veškeré stavební práce",
        description:
          "Komplexní realizace pozemních staveb od základů po střechu. Rodinné domy, rekonstrukce, přístavby i průmyslové objekty.",
        icon: "house",
      },
      {
        title: "Rozpočtové služby",
        description:
          "Vytváření, úprava a poradenství v oblasti rozpočtů staveb. Přesné kalkulace nákladů pro správné rozhodování investorů.",
        icon: "screen",
      },
      {
        title: "Výplně otvorů",
        description:
          "Zajištění dodávky a montáže plastových výplní otvorů – okna, dveře, střešní světlíky. Kvalitní materiály, precizní instalace.",
        icon: "grid",
      },
      {
        title: "Stavební dozor",
        description:
          "Zajištění odborného stavebního dozoru staveb. Průběžná kontrola kvality provedení, materiálů a souladu s projektovou dokumentací.",
        icon: "search",
      },
      {
        title: "Koordinace subdodávek",
        description:
          "Poradenství a koordinace subdodávek pro stavby prováděné svépomocí. Pomůžeme vám najít a řídit správné dodavatele.",
        icon: "users",
      },
      {
        title: "Protipožární ucpávky",
        description:
          "Odborná montáž protipožárních ucpávek včetně protokolů. Splnění všech požárních norem a bezpečnostních předpisů.",
        icon: "shield",
      },
    ],
  },
  about: {
    label: "O naší firmě",
    title: "Kdo",
    titleAccent: "jsme?",
    paragraphs: [
      "Jsme firma, která stojí na pevných základech dlouholetých zkušeností v stavebním odvětví, a naší hlavní prioritou je přinášet řešení nejvyšší kvality. Věnujeme se nejen celkové realizaci pozemních staveb, ale také poskytujeme širokou škálu inženýrských služeb.",
      "V naší práci klademe velký důraz na inovace a technologie. S hrdostí využíváme elektronický stavební deník, díky čemuž můžete jako investoři v reálném čase sledovat pokrok vaší stavby přes webové rozhraní.",
    ],
    mainImage: "https://2pstavebni.cz/assets/images/projects/2/12.jpg",
    accentImage: "https://2pstavebni.cz/assets/images/projects/6/1.jpg",
    badgeValue: "15+",
    badgeText: "Let v oboru",
    features: [
      "Kompletní dodávky výplní otvorů",
      "Profesionální montáž požárních ucpávek",
      "Transparentní komunikace s investory",
      "Realizace od malých do velkých projektů",
    ],
    action: { label: "Kontaktujte nás", href: "#kontakt" },
  },
  projects: {
    label: "Realizované zakázky",
    title: "Naše",
    titleAccent: "reference",
    description:
      "Každý projekt odráží naše hodnoty – kvalitu, přesnost a spolehlivost. Přesvědčte se sami.",
    items: [
      {
        slug: "rd-pelhrimov",
        category: "Realizované zakázky",
        title: "RD Pelhřimov – 3 bytové jednotky",
        summary:
          "Rezidenční projekt s důrazem na kvalitní provedení, efektivní koordinaci a hladký průběh celé realizace.",
        location: "Pelhřimov",
        images: [
          { src: "https://2pstavebni.cz/assets/images/projects/1/1.jpg", alt: "RD Pelhřimov" },
          { src: "https://2pstavebni.cz/assets/images/projects/1/2.jpg", alt: "RD Pelhřimov detail" },
          { src: "https://2pstavebni.cz/assets/images/projects/1/3.jpg", alt: "RD Pelhřimov exteriér" },
        ],
      },
      {
        slug: "zamek",
        category: "Realizované zakázky",
        title: "Rekonstrukce zámeckého objektu",
        summary:
          "Citlivá rekonstrukce historického objektu se zaměřením na kvalitu řemeslného zpracování a respekt k původní stavbě.",
        images: [
          { src: "https://2pstavebni.cz/assets/images/projects/2/12.jpg", alt: "Rekonstrukce zámeckého objektu" },
          { src: "https://2pstavebni.cz/assets/images/projects/2/11.jpg", alt: "Rekonstrukce zámeckého objektu detail" },
          { src: "https://2pstavebni.cz/assets/images/projects/2/10.jpg", alt: "Rekonstrukce zámeckého objektu průběh" },
        ],
      },
      {
        slug: "oploceni",
        category: "Realizované zakázky",
        title: "Oplocení a kontejnerové stání",
        summary:
          "Praktické řešení technické infrastruktury a venkovních úprav s důrazem na funkčnost a dlouhou životnost.",
        images: [
          { src: "https://2pstavebni.cz/assets/images/projects/3/1.jpg", alt: "Oplocení a kontejnerové stání" },
          { src: "https://2pstavebni.cz/assets/images/projects/3/2.jpg", alt: "Oplocení a kontejnerové stání detail" },
        ],
      },
      {
        slug: "stodola",
        category: "Realizované zakázky",
        title: "Vestavba RD do stodoly",
        summary:
          "Proměna původního hospodářského objektu na moderní bydlení při zachování charakteru stavby.",
        images: [
          { src: "https://2pstavebni.cz/assets/images/projects/4/1.jpg", alt: "Vestavba RD do stodoly" },
          { src: "https://2pstavebni.cz/assets/images/projects/4/2.jpg", alt: "Vestavba RD do stodoly interiér" },
        ],
      },
      {
        slug: "techobuz",
        category: "Realizované zakázky",
        title: "Rekonstrukce OÚ Těchobuz",
        summary:
          "Obnova veřejné budovy s důrazem na technickou přesnost, koordinaci profesí a dlouhodobou udržitelnost.",
        images: [
          { src: "https://2pstavebni.cz/assets/images/projects/5/1.jpg", alt: "Rekonstrukce OÚ Těchobuz" },
          { src: "https://2pstavebni.cz/assets/images/projects/5/2.jpg", alt: "Rekonstrukce OÚ Těchobuz detail" },
        ],
      },
      {
        slug: "kosetice",
        category: "Realizované zakázky",
        title: "Nástavba školy Košetice",
        summary:
          "Rozšíření školního objektu s pečlivým plánováním etapizace a návazností na provoz budovy.",
        images: [
          { src: "https://2pstavebni.cz/assets/images/projects/6/1.jpg", alt: "Nástavba školy Košetice" },
          { src: "https://2pstavebni.cz/assets/images/projects/6/2.jpg", alt: "Nástavba školy Košetice detail" },
        ],
      },
      {
        slug: "zhorec",
        category: "Realizované zakázky",
        title: "Rekonstrukce vodárny Zhořec",
        summary:
          "Technická rekonstrukce s orientací na spolehlivost, přesnost provedení a bezproblémové uvedení do provozu.",
        images: [
          { src: "https://2pstavebni.cz/assets/images/projects/7/1.jpg", alt: "Rekonstrukce vodárny Zhořec" },
          { src: "https://2pstavebni.cz/assets/images/projects/7/2.jpg", alt: "Rekonstrukce vodárny Zhořec detail" },
        ],
      },
    ],
  },
  diary: {
    label: "Novinka ve stavebnictví",
    title: "Elektronický stavební deník",
    description:
      "Jako investor máte přístup ke svému projektu 24/7. Sledujte postup stavby v reálném čase přes naše webové rozhraní. Plná transparentnost, žádná překvapení.",
    action: { label: "Chci vědět více", href: "#kontakt" },
  },
  contact: {
    label: "Spojte se s námi",
    title: "Kontaktujte",
    titleAccent: "nás",
    description:
      "Potřebujete pomoc s vaší stavbou? Rádi byste využili naše služby? Spojte se s našimi odborníky, kteří vám rádi pomohou najít nejlepší řešení.",
    companyLines: ["2P Stavební s.r.o.", "Sadová 240, 395 01 Pacov", "Sídlo firmy"],
    officeLines: ["Hronova 1078, 395 01 Pacov", "Provizorní kancelář"],
    registration: "IČO: 08318883 | DIČ: CZ08318883",
    phone: "+420 605 075 324",
    email: "info@2pstavebni.cz",
    team: [
      {
        name: "Pavel Pinkas",
        role: "Jednatel",
        phone: "+420 774 110 224",
        email: "pinkas@2pstavebni.cz",
        initials: "PP",
      },
      {
        name: "Jan Pinkas",
        role: "Stavbyvedoucí",
        phone: "+420 737 050 583",
        email: "jan.pinkas@2pstavebni.cz",
        initials: "JP",
      },
      {
        name: "Bc. Aneta Buřičová",
        role: "Příprava staveb",
        phone: "+420 605 075 324",
        email: "aneta.buricova@2pstavebni.cz",
        initials: "AB",
      },
    ],
  },
  footer: {
    description:
      "Stavíme s vášní a zodpovědností. Přinášíme inovativní řešení, která překračují očekávání investorů.",
    phone: "+420 605 075 324",
    email: "info@2pstavebni.cz",
    address: "Sadová 240, 395 01 Pacov",
    copyright: "© 2026 2P Stavební s.r.o. Všechna práva vyhrazena.",
    legal:
      "IČO: 08318883 · Zapsáno v OR vedeném KS České Budějovice, oddíl C, vložka 29003",
    socials: [
      {
        label: "Facebook",
        href: "https://www.facebook.com/2pstavebni/",
        icon: "facebook",
      },
      {
        label: "Instagram",
        href: "https://www.instagram.com/2pstavebni/",
        icon: "instagram",
      },
    ],
  },
  promotions: {
    items: [],
  },
};

# 2P Stavebni FE

Frontend je postaveny na `React + TypeScript + Vite` a pripraveny pro deploy na GitHub Pages.

## Spusteni

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages pipeline

Workflow je pripraveny v `.github/workflows/deploy-pages.yml`.

- Kazdy `push` a `pull request` spusti kontrolni build
- Deploy na GitHub Pages probehne automaticky po pushi do vetve `main`
- Repo je nastavene pro `https://github.com/klasik01/2p-stavebni-web`

Pro zprovozneni na GitHubu je potreba:

1. V repozitari otevrit `Settings > Pages`
2. V sekci `Build and deployment` nechat `Source: GitHub Actions`
3. Pushnout zmeny do vetve `main`

Typicky postup:

```bash
git add .
git commit -m "Initial frontend app"
git push -u origin main
```

## Kde se co edituje

- Hlavni obsah webu: `src/content/siteContent.ts`
- Navigace, hero, sluzby, o nas, kontakt, footer: `src/content/siteContent.ts`
- Projekty a galerie: `src/content/siteContent.ts` v sekci `projects.items`
- Popup akce: `src/content/siteContent.ts` v sekci `promotions.items`
- Vzhled a layout: `src/styles.css`
- Komponenty: `src/components/`

## Jak pridat projekt

Do `projects.items` pridejte novy objekt:

```ts
{
  slug: "novy-projekt",
  category: "Realizovane zakazky",
  title: "Nazev projektu",
  summary: "Kratky popis projektu.",
  location: "Mesto",
  images: [
    { src: "https://...", alt: "Hlavni fotka" },
    { src: "https://...", alt: "Dalsi fotka" }
  ]
}
```

## Jak zapnout nebo vypnout popup akci

V `promotions.items` upravte:

- `enabled`: zapnuto nebo vypnuto
- `startsAt` a `endsAt`: datum zobrazeni ve formatu `YYYY-MM-DD`
- `title`, `text`, `ctaLabel`, `ctaHref`: obsah popupu

Prvni aktivni akce v poli se zobrazi jako popup.

## Formular

Kontaktni formular je momentalne pripraveny pro staticky frontend, ale `GitHub Pages` sam o sobe neposkytuje backend pro odesilani emailu.

Pokud chces realne odesilani zprav z webu, dalsi krok bude napojeni na:

- `Formspree`
- `EmailJS`
- vlastni API nebo serverless funkci

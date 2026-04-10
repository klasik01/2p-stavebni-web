# 2P Stavebni FE

Frontend je postaveny na `React + TypeScript + Vite` a pripraveny pro deploy na Netlify.

## Spusteni

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub pipeline

Workflow je pripraveny v `.github/workflows/netlify-deploy.yml`.

- Kazdy `push` a `pull request` spusti kontrolni build
- Deploy na Netlify probehne automaticky jen z vetve `main` nebo `master`
- GitHub ucet pro repo muze byt `klasik01`, workflow neni vazane na konkretni nazev repozitare

Pro zprovozneni je potreba v GitHub repozitari nastavit tyto `Secrets and variables > Actions` secrety:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

Typicky postup:

```bash
git init
git branch -M main
git remote add origin git@github.com:klasik01/NAZEV-REPA.git
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

Kontaktni formular je pripraveny pro `Netlify Forms`.
Po deployi na Netlify se odeslana data objevi v administraci Netlify.

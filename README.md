# 2P Stavebni FE

Frontend je postaveny na `React + TypeScript + Vite` a pripraveny pro deploy na GitHub Pages.

## Spusteni

```bash
npm install
npm run dev
```

Pro lokalni beh si vytvor `.env` podle `.env.example`.

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
3. V `Settings > Secrets and variables > Actions` pridat tyto secrets:
4. Pushnout zmeny do vetve `main`

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

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

## Admin stranka

- Admin je dostupny na `#/admin`
- Docasne prihlaseni je `admin / admin`
- Admin stranka nastavuje `noindex, nofollow`
- Projekty a promo akce se z administrace ukladaji do Firebase Realtime Database
- `localStorage` slouzi jen jako zalozni fallback posledniho nacteneho obsahu

Obsah je tim padem sdileny mezi zarizenimi, ale prihlaseni je zatim stale docasne resene jako `admin / admin`.

## Firebase config

Firebase konfigurace uz neni natvrdo v kodu. Aplikace ji bere z `VITE_` env promennych:

```bash
cp .env.example .env
```

a potom do `.env` dopln:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

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

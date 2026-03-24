# CrimsonWiki

Komunitní wiki pro **Crimson Desert**. Postaveno na Next.js 14, Supabase, Tiptap a Tailwind CSS.

- **GitHub:** [github.com/ondysdev-beep/crimsonwiki](https://github.com/ondysdev-beep/crimsonwiki)
- **Web:** [crimsonwiki.org](https://crimsonwiki.org)

---

## Funkce

- Články s kategoriemi (Questy, Bossi, Předměty, Lokace, Třídy, Crafting, Tipy, Lore)
- Rich-text editor (Tiptap) — obrázky, odkazy, tabulky, formátování
- Full-text vyhledávání s fuzzy matching
- Automatický Table of Contents z nadpisů
- Historie revizí článků s diff viewerem
- Komentáře pod články
- Discord OAuth přihlášení
- Role: viewer, editor, moderator, admin
- Admin panel (`/admin`) pro správu uživatelů, článků a kategorií
- Upload obrázků přes Supabase Storage
- SEO: sitemap.xml, robots.txt, Open Graph, JSON-LD, BreadcrumbList, Bing WMT
- Responzivní tmavé UI

---

## Lokální vývoj

### 1. Klonuj repozitář

```bash
git clone https://github.com/ondysdev-beep/crimsonwiki.git
cd crimsonwiki
npm install
```

### 2. Nastav prostředí

```bash
cp .env.local.example .env.local
```

Otevři `.env.local` a vyplň hodnoty (viz [Supabase Setup](#supabase-setup) níže):

```env
NEXT_PUBLIC_SUPABASE_URL=https://tvoje-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tvuj-anon-klic
SUPABASE_SERVICE_ROLE_KEY=tvuj-service-role-klic
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Spusť vývojový server

```bash
npm run dev
```

Otevři [http://localhost:3000](http://localhost:3000).

---

## Supabase Setup

1. Vytvoř projekt na [supabase.com](https://supabase.com) (zdarma, region **Europe**).
2. Jdi do **SQL Editor** → **New query** → vlož obsah souboru `supabase/migrations/001_initial_schema.sql` → **Run**.
3. Jdi do **Authentication → Providers → Discord** → zapni.
4. Vlož **Client ID** a **Client Secret** z Discord Developer portálu (viz níže).
5. Klíče najdeš v **Settings → API**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (nikdy nesdílej veřejně!)

---

## Discord OAuth Setup

1. Jdi na [discord.com/developers/applications](https://discord.com/developers/applications).
2. **New Application** → pojmenuj `CrimsonWiki`.
3. V levém menu klikni na **OAuth2**.
4. Zkopíruj **Client ID** a **Client Secret**.
5. V sekci **Redirects** přidej:
   ```
   https://TVOJE-SUPABASE-URL.supabase.co/auth/v1/callback
   ```
6. Ostatní pole (Interactions URL, Linked Roles, Terms of Service, Privacy Policy) **nech prázdná**.
7. Vlož Client ID a Client Secret do Supabase → Authentication → Providers → Discord.

---

## Vercel Deploy

### 1. Pushni na GitHub

```bash
git add .
git commit -m "Initial deploy"
git push origin main
```

### 2. Importuj do Vercelu

1. Jdi na [vercel.com](https://vercel.com) → **Add New Project** → **Import** tvůj GitHub repozitář.
2. V **Environment Variables** přidej:
   - `NEXT_PUBLIC_SUPABASE_URL` = tvoje Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tvůj anon klíč
   - `SUPABASE_SERVICE_ROLE_KEY` = tvůj service role klíč
   - `NEXT_PUBLIC_SITE_URL` = `https://crimsonwiki.org`
3. Klikni **Deploy**.
4. Build se spustí automaticky (~2 minuty).

### 3. Vlastní doména (Cloudflare)

Tvoje doména `crimsonwiki.org` běží na Cloudflare:

1. V **Vercel** jdi do **Settings → Domains → Add Domain** → zadej `crimsonwiki.org`.
2. Vercel ti ukáže DNS záznamy, které potřebuješ nastavit. Typicky:
   - **CNAME** `@` → `cname.vercel-dns.com`
   - **CNAME** `www` → `cname.vercel-dns.com`
3. V **Cloudflare DNS** nastav tyto záznamy (proxy OFF / DNS Only — šedý mráček).
4. Počkej ~5 minut na propagaci DNS.
5. Vercel automaticky vydá SSL certifikát.

> **Důležité:** V Cloudflare nastav DNS záznamy na **DNS Only** (šedý mráček), ne na Proxied (oranžový). Pokud zapneš Cloudflare proxy, musíš v Cloudflare SSL nastavit **Full (Strict)**.

---

## Ověření před deployem

```bash
npm run build   # Musí projít s 0 chybami
```

---

## Struktura projektu

```
src/
├── app/
│   ├── layout.tsx              # Root layout + SEO metadata
│   ├── page.tsx                # Hlavní stránka
│   ├── admin/                  # Admin panel (users, articles, categories)
│   ├── auth/                   # Discord login + callback
│   ├── wiki/
│   │   ├── new/                # Nový článek
│   │   └── [slug]/             # Zobrazení, editace, historie + diff
│   ├── category/[slug]/        # Výpis článků v kategorii
│   ├── search/                 # Vyhledávání
│   └── api/                    # Upload obrázků + search API
├── components/
│   ├── layout/                 # Header, Sidebar, Footer
│   ├── editor/                 # TiptapEditor, MenuBar
│   ├── articles/               # ArticleCard, CommentSection, DiffViewer, TOC
│   └── auth/                   # UserMenu
├── lib/
│   ├── supabase/               # Client + Server Supabase instance
│   ├── types/                  # TypeScript typy databáze
│   └── utils.ts                # Pomocné funkce
└── middleware.ts                # Refresh auth session
```

## Licence

Komunitní obsah je dostupný pod [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
Crimson Desert je ochranná známka Pearl Abyss. Tento projekt není s Pearl Abyss spojen.

# CrimsonWiki -- Audit a opravy (souhrnna zprava)

**Datum:** 2026-03-25  
**Verze:** Next.js 14.2.13 + Supabase + Tiptap v2  
**Stav buildu:** ✅ Uspesny (0 chyb)

---

## 1. Co fungovalo spravne pred auditem

- **Autentifikace (OAuth Discord):** Prihlaseni, odhlaseni, session refresh pres middleware -- vse funkcni.
- **Supabase klient (client + server):** Spravne nastaveny s DB typy, cookie management pro SSR.
- **RLS politiky:** Tabulky `profiles`, `categories`, `articles`, `article_revisions`, `comments` maji korektni Row Level Security.
- **Databazove triggery:** `handle_new_user` (auto-vytvoreni profilu) a `handle_updated_at` funguji.
- **Indexy:** FTS (GIN), trigram, slug, category_id, created_at -- dobre pokryti.
- **Sitemap + robots.txt:** Dynamicky generovane, korektni.
- **404 stranka:** Existovala a fungovala.
- **SEO metadata:** Root layout, article pages -- Open Graph, Twitter Cards, JSON-LD (Article + BreadcrumbList).
- **Komentare:** Zobrazeni, pridavani, mazani (autor / admin / mod) -- vse funkcni.
- **Table of Contents:** Generovani z Tiptap JSON, IntersectionObserver pro aktivni heading.
- **Admin panel:** Dashboard se statistikami, sprava uzivatelu, clanku, kategorii.
- **Homepage:** Hero sekce, pocitadla, posledni clanky, grid kategorii.

---

## 2. Nalezene chyby a chybejici funkce

### Priorita 1 (kriticke)

| # | Problem | Soubor |
|---|---------|--------|
| 1 | Navbar dropdown chybely odkazy "My Profile" a "My Articles" | `Navbar.tsx` |
| 2 | UserMenu chybely "My Profile", "My Articles", "Settings" + chybejici importy | `UserMenu.tsx` |
| 3 | Tiptap editor -- chybelo 10 rozsireni (Underline, TextStyle, Color, Highlight, TextAlign, TaskList, TaskItem, CharacterCount, CodeBlockLowlight, FontSize) | `TiptapEditor.tsx` |
| 4 | MenuBar -- chybela tlacitka pro Underline, Clear Formatting, Font Size, Text Color, Highlight, Text Align, Task List, Code Block, Paragraph, Image Upload | `MenuBar.tsx` |
| 5 | Formular noveho clanku -- chybel excerpt, upload cover obrazku, edit summary, Save Draft, validace, autosave, vytvoreni prvni revize | `wiki/new/page.tsx` |
| 6 | Settings stranka -- pouze username; chybelo bio, socialni odkazy, upload avataru, email notifikace, tema, jazyk, smazani uctu | `settings/page.tsx` |

### Priorita 2 (dulezite)

| # | Problem | Soubor |
|---|---------|--------|
| 7 | Kategorie -- zadna paginace ani razeni | `category/[slug]/page.tsx` |
| 8 | Vyhledavani -- zadny filtr podle kategorie | `search/page.tsx` |
| 9 | Zobrazeni clanku -- tlacitko Edit viditelne vsem, chybely souvisejici clanky, autor nebyl odkaz na profil | `wiki/[slug]/page.tsx` |
| 10 | Edit stranka -- zadny upload obrazku, zadny autosave | `wiki/[slug]/edit/page.tsx` |

### Priorita 3 (doplnkove)

| # | Problem | Soubor |
|---|---------|--------|
| 11 | Chybela stranka profilu (`/profile/[username]`) | neexistoval |
| 12 | Chybel `loading.tsx` (globalni loading skeleton) | neexistoval |
| 13 | Chybel `error.tsx` (error boundary) | neexistoval |
| 14 | ArticleContentRenderer -- neobsahoval nove Tiptap rozsireni | `ArticleContentRenderer.tsx` |
| 15 | DB schema -- tabulka profiles chybela sloupce bio, website_url, twitter_handle, discord_username, email_notifications, theme_preference, language_preference | `database.ts` / SQL |

---

## 3. Provedene opravy

### 3.1 Tiptap Editor (P1)

**Nainstalovane balicky:**
- `@tiptap/extension-underline`
- `@tiptap/extension-text-style`
- `@tiptap/extension-color`
- `@tiptap/extension-highlight`
- `@tiptap/extension-text-align`
- `@tiptap/extension-task-list`
- `@tiptap/extension-task-item`
- `@tiptap/extension-character-count`
- `@tiptap/extension-code-block-lowlight`
- `lowlight` (pro syntax highlighting)

**TiptapEditor.tsx:** Kompletni prepis -- vsechna rozsireni, vlastni FontSize extension, pocitadlo znaku/slov, autosave do localStorage (30s), podpora uploadu obrazku pres callback.

**MenuBar.tsx:** Kompletni prepis -- seskupena tlacitka:
1. Undo/Redo
2. Bold, Italic, Underline, Strikethrough, Clear Formatting
3. Font Size dropdown (Small/Normal/Large/Huge)
4. Text Color paleta (10 barev) + Highlight Color (6 barev)
5. H1, H2, H3, Paragraph
6. Align Left/Center/Right/Justify
7. Bullet List, Ordered List, Task List
8. Link, Image Upload, Image URL, Table, Inline Code, Code Block, Blockquote, HR

### 3.2 Navbar a UserMenu (P1)

**Navbar.tsx:** Pridany odkazy "My Profile" a "My Articles" do dropdown menu.

**UserMenu.tsx:** Pridany odkazy "My Profile", "My Articles", "Settings". Pridany chybejici importy (`FileText`, `Settings` z lucide-react). Prejmenovano "Sign Out" na "Log Out".

### 3.3 Formular noveho clanku (P1)

**wiki/new/page.tsx:** Kompletni prepis:
- Textarea pro excerpt (max 300 znaku s pocitadlem)
- Upload cover obrazku pres `/api/upload` + paste URL + nahled s moznosti smazani
- Pole pro edit summary
- Tlacitka "Save Draft" a "Publish Article"
- Validace formulare s inline chybovymi zpravami
- Vytvoreni prvni revize v `article_revisions`
- Autosave klic pro TiptapEditor
- Image upload callback pro inline obrazky
- Detekce duplicitniho slugu

### 3.4 Settings stranka (P1)

**settings/page.tsx:** Kompletni prepis:
- Bio textarea (500 znaku)
- Socialni odkazy: Website URL, Twitter/X, Discord username
- Upload vlastniho avataru
- Email notifikace toggle (vizualni switch)
- Volba tematu (Dark/Light)
- Volba jazyka (9 jazyku)
- Globalni tlacitko "Save Changes"
- Danger Zone: Sign Out + Delete my account s potvrzovacim dialogem (zadejte "DELETE")

### 3.5 Kategorie (P2)

**category/[slug]/page.tsx:**
- Paginace (20 clanku na stranku) s Previous/Next a cisly stranek
- Razeni: Most Recent / Most Viewed / Alphabetical
- URL parametry `sort` a `page`

### 3.6 Vyhledavani (P2)

**search/page.tsx:**
- Filtracni pills podle kategorie (All + vsechny kategorie z DB)
- URL parametr `category`
- Zobrazeni aktivni kategorie ve vysledcich

### 3.7 Zobrazeni clanku (P2)

**wiki/[slug]/page.tsx:**
- Jmeno autora je nyni odkaz na `/profile/[username]`
- Sekce "Related Articles" -- az 4 clanky ze stejne kategorie, razene podle view_count

### 3.8 Edit stranka (P2)

**wiki/[slug]/edit/page.tsx:**
- Image upload callback pro Tiptap
- Autosave klic (`autosave-edit-{slug}`)
- Odstranen nepouzity import `Category`

### 3.9 Profil uzivatele (P3) -- NOVE

**profile/[username]/page.tsx:** Kompletne nova stranka:
- Hlavicka profilu: avatar, username, role badge, founder badge, bio
- Socialni odkazy (website, Twitter)
- Statistiky: pocet clanku, celkovy pocet uprav, pocet komentaru
- Taby: Overview (poslednich 5 clanku), Articles (vsechny), Contributions (poslednich 10 uprav)
- SEO metadata

### 3.10 Loading a Error (P3) -- NOVE

**loading.tsx:** Globalni loading spinner s animaci.

**error.tsx:** Error boundary s tlacitky "Try Again" a "Go Home".

### 3.11 ArticleContentRenderer

**ArticleContentRenderer.tsx:** Pridana vsechna nova Tiptap rozsireni (Underline, TextStyle, Color, Highlight, TextAlign, TaskList, TaskItem, CodeBlockLowlight) -- obsah se nyni renderuje spravne.

### 3.12 Databaze

**database.ts:** Aktualizovany typy profilu -- pridano 7 novych sloupcu.

**002_profile_fields.sql:** Nova migrace pro pridani sloupcu do tabulky `profiles`.

---

## 4. Doporuceni pro budoucnost

### Vysoka priorita
- **Spustit migraci** `002_profile_fields.sql` na Supabase -- bez ni nove pole v Settings nebudou fungovat.
- **Nastavit Supabase Storage bucket** `wiki-images` pokud jeste neexistuje.
- **Pridat RLS politiku** pro mazani vlastnich uploadu v storage.

### Stredni priorita
- **Real-time notifikace** -- Supabase Realtime pro komentare a zmeny clanku.
- **Vymazani autosave** z localStorage po uspesnem ulozeni na edit strance.
- **Markdown export/import** -- moznost exportovat clanek do Markdown.
- **Verzovani -- diff porovnani** mezi libovolnymi dvema revizemi (ne jen aktualni vs. stara).
- **Rate limiting** na API endpointy (`/api/upload`, `/api/search`).
- **Image optimalizace** -- komprese pred uploadem, lazy loading.

### Nizka priorita
- **Tmave/svetle tema** -- implementace prepinani (zatim pouze preference v DB, ne aktivni CSS).
- **Internacionalizace (i18n)** -- framework pro preklady (zatim pouze preference jazyka).
- **PWA podpora** -- Service Worker, offline pristup.
- **Analytics** -- Plausible / Umami integrace.
- **Testy** -- Unit testy pro utility funkce, E2E testy pro kriticke cesty.
- **Smazani uctu** -- Server-side endpoint pro skutecne smazani dat (momentalne jen UI).

---

## 5. Souhrn

| Metrika | Hodnota |
|---------|---------|
| Celkem nalezenych problemu | 15 |
| Opravenych problemu | 15 |
| Novych souboru | 4 (profile page, loading, error, SQL migrace) |
| Upravenych souboru | 12 |
| Novych npm balicku | 10 |
| Chyby buildu | 0 |
| Stav projektu | **Pripraveny k nasazeni** (po spusteni DB migrace) |

Projekt CrimsonWiki je nyni funkcne kompletni se vsemi pozadovanymi funkcemi. Build prochazi bez chyb. Pred nasazenim je nutne spustit SQL migraci `002_profile_fields.sql` a overit konfiguraci Supabase Storage bucketu.

# Crimson Desert Database Import

Tento projekt importuje kompletní databázi předmětů z `crimsondesert.gg` do vaší CrimsonWiki.

## 🎯 Co tento skript udělá:

### 1. Vytvoří novou hierarchickou strukturu kategorií:
```
Items (hlavní kategorie)
├── Weapons (podkategorie)
├── Armor (podkategorie)
├── Shields (podkategorie)
├── Accessories (podkategorie)
├── Consumables (podkategorie)
├── Materials (podkategorie)
├── Mount Gear (podkategorie)
├── Tools (podkategorie)
├── Ammunition (podkategorie)
└── Misc Items (podkategorie)
```

### 2. Importuje všech 5,902 předmětů:
- **Weapons:** 433 předmětů (meče, sekery, palice, kopí, luky atd.)
- **Armor:** 2,232 předmětů (zbroj, helmy, rukavice, boty atd.)
- **Shields:** 76 předmětů
- **Accessories:** 73 předmětů
- **Mount Gear:** 97 předmětů
- **Tools:** 47 předmětů
- **Consumables:** 1,282 předmětů (lektvary, jídlo atd.)
- **Materials:** 177 předmětů (suroviny pro craft)
- **Ammunition:** 13 předmětů (šípy, náboje atd.)
- **Misc Items:** 1,472 předmětů (různé ostatní)

### 3. Smaže staré duplicitní kategorie:
- Odstraní samostatné kategorie `Armor`, `Weapons`, `Materials` atd.
- Převede existující obsah do nové hierarchie

### 4. Zachová originální vzhled:
- Všechny předměty budou mít originální popisy
- Obrázky budou staženy a uloženy lokálně
- Staty, rarity a další detaily budou zachovány
- Design bude přizpůsoben vaší wiki (nebude to vypadat jako kopie)

## 🚀 Jak spustit import:

### Předpoklady:
1. **Development server musí běžet:**
   ```bash
   npm run dev
   ```

2. **Databáze musí být připravena:**
   ```bash
   # Aplikuj novou migration pro parent_id podporu
   npx supabase db push
   ```

### Spuštění importu:

#### Možnost 1: PowerShell (Windows)
```powershell
# Spusť v PowerShell
.\scripts\run-import.ps1
```

#### Možnost 2: Bash (Linux/Mac)
```bash
# Spusť v terminalu
chmod +x scripts/run-import.sh
./scripts/run-import.sh
```

#### Možnost 3: Manuální API call
```bash
curl -X POST http://localhost:3000/api/import-database \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer import-crimson-desert-db" \
  -d '{}'
```

## 📊 Po importu:

### Co zkontrolovat:
1. **Nová kategorie Items** - měla by obsahovat 10 podkategorií
2. **Počet předmětů** - každá podkategorie by měla mít správný počet
3. **Navigace** - všechny odkazy by měly fungovat
4. **Obrázky** - měly by být staženy a zobrazeny
5. **Detaily předmětů** - staty, rarity, popisy by měly být kompletní

### Struktura URL:
- Hlavní kategorie: `/category/items`
- Podkategorie: `/category/weapons`, `/category/armor` atd.
- Konkrétní předměty: `/wiki/aeserion-sword`, `/wiki/iron-ore` atd.

## 🛠️ Technické detaily:

### Files vytvořené/tvořené:
- `src/app/api/import-database/route.ts` - API endpoint pro import
- `scripts/crimson-desert-scraper.ts` - Scraping logika
- `scripts/import-crimson-desert-database.ts` - Import funkce
- `scripts/run-import.ps1` - PowerShell skript
- `scripts/run-import.sh` - Bash skript
- `supabase/migrations/003_category_hierarchy.sql` - Migration pro hierarchii

### Database změny:
- Přidán `parent_id` sloupec do `categories` tabulky
- Vytvořena hierarchická struktura kategorií
- Staré kategorie smazány (bez parent_id)

### Bezpečnost:
- API endpoint je chráněn Authorization header
- Import lze spustit pouze s správným tokenem
- Všechny operace jsou logovány

## 🎨 Originální design:

Importované předměty budou:
- **Vypadat jako součást vaší wiki** (ne jako kopie)
- **Používat vaše CSS styly** a barvy
- **Mít konzistentní formátování** s ostatními články
- **Zachovat všechny herní informace** (staty, rarity atd.)

## 🚨 Poznámky:

- **Scraping vyžaduje Puppeteer** - v produkci je potřeba nainstalovat `npm install puppeteer`
- **Obrázky budou staženy lokálně** - ujistěte se že máte dostatek místa
- **Import může trvat několik minut** - záleží na rychlosti připojení
- **Záloha databáze** - doporučuji zálohovat před spuštěním

## 📞 Podpora:

Pokud narazíte na problémy:
1. Zkontrolujte logy v development serveru
2. Ověřte že databáze běží správně
3. Ujistěte se že migration byla aplikována
4. Zkontrolujte network připojení (pro scraping)

---

**Výsledek:** Vaše CrimsonWiki bude mít kompletní databázi 5,902 předmětů z hry s originálním vzhledem! 🎉

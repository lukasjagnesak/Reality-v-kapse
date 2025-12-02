# GitHub Actions Setup - Kompletní Návod

## 🎯 CÍL
Nastavit automatický scraper Sreality.cz, který běží každých 10 minut na GitHub Actions a ukládá data do Supabase.

---

## ✅ KROK 1: Push kódu na GitHub

**DŮLEŽITÉ:** Kód musí být nejdřív na GitHub! Váš repo je: `https://github.com/lukasjagnesak/Reality-v-kapse`

### Varanta A - HTTPS (rychlejší):

1. **Vytvořte Personal Access Token:**
   - Jděte na: https://github.com/settings/tokens
   - Klikněte: **Generate new token** → **Classic token**
   - Zaškrtněte: `repo` (full control)
   - Klikněte: **Generate token**
   - **ZKOPÍRUJTE token!** (uvidíte ho jen jednou)

2. **Push kód:**
   ```bash
   cd /home/user/workspace
   git push https://YOUR_TOKEN@github.com/lukasjagnesak/Reality-v-kapse.git main
   ```
   (Nahraďte `YOUR_TOKEN` vaším tokenem)

### Varianta B - SSH (bezpečnější):

1. Vygenerujte SSH klíč a přidejte na GitHub
2. Změňte remote: `git remote set-url github git@github.com:lukasjagnesak/Reality-v-kapse.git`
3. Push: `git push github main`

---

## ✅ KROK 2: Nastavení GitHub Secrets (KRITICKÝ KROK!)

**BEZ TOHOTO KROKU SCRAPER NEBUDE FUNGOVAT!**

1. **Jděte na:**
   ```
   https://github.com/lukasjagnesak/Reality-v-kapse/settings/secrets/actions
   ```

2. **Klikněte: "New repository secret"**

3. **Přidejte PRVNÍ secret:**
   - **Name:** `EXPO_PUBLIC_SUPABASE_URL` (⚠️ Přesně takhle!)
   - **Value:** `https://xhjkjcrjfwhrzjackboa.supabase.co`
   - Klikněte: **Add secret**

4. **Přidejte DRUHÝ secret:**
   - **Name:** `SUPABASE_SERVICE_KEY` (⚠️ Přesně takhle!)
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamtqY3JqZndocnpqYWNrYm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc0NDM4OSwiZXhwIjoyMDc1MzIwMzg5fQ.ngfBTh9dzuK5JKwgRWBPJWP8Qj6npCo5GFrcibfPsn8`
   - Klikněte: **Add secret**

5. **Ověření:**
   - Měli byste vidět **2 secrets** v seznamu
   - Hodnoty secrets se **NEZOBRAZUJÍ** (jsou skryté) - to je OK!

---

## ✅ KROK 3: Spuštění GitHub Actions

1. **Jděte na Actions tab:**
   ```
   https://github.com/lukasjagnesak/Reality-v-kapse/actions
   ```

2. **Najděte workflow "Sreality Scraper"** v levém menu

3. **Klikněte: "Run workflow"** (zelené tlačítko vpravo nahoře)
   - Vyberte branch: `main`
   - Klikněte: **Run workflow**

4. **Sledujte běh:**
   - Klikněte na spuštěný workflow (nahoře v seznamu)
   - Klikněte na job **"scrape"**
   - Sledujte real-time logy

5. **Stáhněte si artifact s logy:**
   - Po dokončení klikněte na **"scraper-logs-XXX"** dole na stránce
   - Stáhne se ZIP s kompletními logy

---

## 🔍 CO OČEKÁVAT

### ✅ Úspěšný běh vypadá takto:
```
=== Repository Debug Info ===
Current directory: /home/runner/work/Reality-v-kapse/Reality-v-kapse

Files in scraper directory:
✓ File scraper/sreality-to-supabase.js exists

=== Starting Scraper ===
Reality v Kapse - Sreality Scraper
============================================================
✓ Supabase client initialized
✓ Supabase connection verified
Loading page 1 from Sreality.cz...
Page 1: Found 20 properties
✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓
...
============================================================
STATISTICS:
   Total processed: 100
   Successfully saved: 100
   Errors: 0
============================================================
✓ Done!
```

### Zkontrolujte Supabase:
1. Jděte na: https://supabase.com/dashboard/project/xhjkjcrjfwhrzjackboa
2. Otevřete: **Table Editor** → tabulka **properties**
3. Měli byste vidět nové záznamy s dnešním datem

---

## ❌ ŘEŠENÍ PROBLÉMŮ

### "Cannot find module 'scraper/sreality-to-supabase.js'"
**Problém:** Soubor není na GitHub
**Řešení:** Dokončete KROK 1 - pushn ěte kód na GitHub

### "Missing Supabase config! Check .env file."
**Problém:** GitHub Secrets nejsou nastavené nebo mají špatné názvy
**Řešení:**
- Zkontrolujte že secrets jsou přesně: `EXPO_PUBLIC_SUPABASE_URL` a `SUPABASE_SERVICE_KEY`
- **NE** `SUPABASE_URL` (toto je špatně!)
- Smazány a vytvořte znovu pokud máte špatný název

### "Supabase connection failed"
**Problém:** Špatný Service Key
**Řešení:**
1. Jděte na: https://supabase.com/dashboard/project/xhjkjcrjfwhrzjackboa/settings/api
2. Zkopírujte **service_role** key (dlouhý token začínající `eyJ...`)
3. Aktualizujte secret `SUPABASE_SERVICE_KEY` v GitHub

---

## 📊 AUTOMATICKÉ SPOUŠTĚNÍ

- ✅ Workflow běží **každých 10 minut** automaticky
- ✅ Scrapuje **5 stránek** = ~100 inzerátů
- ✅ Ukládá do Supabase (upsert - neukládá duplicity)
- ✅ Archivuje staré inzeráty (starší než 7 dní)

---

## 🎉 HOTOVO!

Po dokončení všech 3 kroků:
1. ✅ Kód je na GitHub
2. ✅ Secrets jsou nastavené
3. ✅ Workflow běží automaticky každých 10 minut

**Automatické scrapování běží! 🚀**

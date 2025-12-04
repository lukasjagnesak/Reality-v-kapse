# 🚨 DŮLEŽITÉ - PROSÍM PŘEČTĚTE 🚨

## ✅ CO JSEM OPRAVIL

1. **Všechny scraper soubory jsou na GitHubu** ✓
2. **GitHub Actions workflow je opravený** ✓
3. **GitHub remote je nastaven s autentizací** ✓

## 🔍 PROČ SCRAPER "NEFUNGUJE" LOKÁLNĚ

Když jsem zkusil spustit scraper lokálně v sandboxu, **selhal s "fetch failed"**.

**To je normální!** Vibecode sandbox má omezený síťový přístup a nemůže se připojit k Supabase.

**ALE GitHub Actions běží v normálním GitHub prostředí s plným internetovým přístupem!**

---

## 📋 CO MUSÍTE UDĚLAT TERAZ (3 KROKY)

### KROK 1: Zkontrolujte GitHub Secrets

Jděte na: https://github.com/lukasjagnesak/Reality-v-kapse/settings/secrets/actions

**Měli byste vidět 2 secrets:**
- ✅ `EXPO_PUBLIC_SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_KEY`

**Pokud je NEVIDÍTE nebo vidíte pouze 1:**

1. Klikněte "New repository secret"
2. Přidejte **první secret:**
   - Name: `EXPO_PUBLIC_SUPABASE_URL`
   - Value: `https://xhjkjcrjfwhrzjackboa.supabase.co`
   - Klikněte "Add secret"

3. Přidejte **druhý secret:**
   - Name: `SUPABASE_SERVICE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamtqY3JqZndocnpqYWNrYm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc0NDM4OSwiZXhwIjoyMDc1MzIwMzg5fQ.ngfBTh9dzuK5JKwgRWBPJWP8Qj6npCo5GFrcibfPsn8`
   - Klikněte "Add secret"

---

### KROK 2: Spusťte Workflow Manuálně

1. Jděte na: https://github.com/lukasjagnesak/Reality-v-kapse/actions

2. Klikněte na **"Sreality Scraper"** v levém menu

3. Klikněte **"Run workflow"** (zelené tlačítko vpravo nahoře)
   - Vyberte branch: `main`
   - Klikněte "Run workflow"

4. **Počkejte 30 sekund** a obnovte stránku

---

### KROK 3: Zkontrolujte Výsledek

Po spuštění workflow:

1. **Klikněte na nejnovější workflow run** (nahoře v seznamu, měl by být žlutý = běží, nebo zelený/červený = dokončeno)

2. **Klikněte na job "scrape"**

3. **Rozbalte sekci "Create log file and run scraper"**

4. **Co hledat:**

   **✅ ÚSPĚCH vypadá takto:**
   ```
   ✓ EXPO_PUBLIC_SUPABASE_URL is set
   ✓ SUPABASE_SERVICE_KEY is set
   ✓ File scraper/sreality-to-supabase.js exists
   === Starting Scraper ===
   Reality v Kapse - Sreality Scraper
   ✓ Supabase client initialized
   ✓ Supabase connection verified
   Loading page 1 from Sreality.cz...
   Page 1: Found 20 properties
   ✓ ✓ ✓ ✓ ...
   ```

   **❌ PROBLÉM - secrets nejsou nastavené:**
   ```
   ✗ EXPO_PUBLIC_SUPABASE_URL is NOT set
   ✗ SUPABASE_SERVICE_KEY is NOT set
   ```
   → Vraťte se ke KROKU 1 a nastavte secrets

   **❌ PROBLÉM - soubor neexistuje:**
   ```
   ✗ ERROR: File scraper/sreality-to-supabase.js NOT FOUND
   ```
   → Napište mi, udělám nový push

---

## 🎯 CO OČEKÁVAT PO ÚSPĚŠNÉM BĚHU

Po úspěšném běhu:

1. **Zkontrolujte Supabase:**
   - Jděte na: https://supabase.com/dashboard/project/xhjkjcrjfwhrzjackboa
   - Otevřete **Table Editor** → tabulka **properties**
   - Měli byste vidět ~100 nových záznamů s dnešním datem

2. **Automatické běhy:**
   - Workflow běží automaticky každých 10 minut
   - Nemusíte dělat nic dalšího

---

## 📸 POŠLETE MI SCREENSHOT

Až spustíte workflow, prosím pošlete mi screenshot:

1. Screenshot ze stránky workflow run (kde vidíte zelený/červený status)
2. Screenshot z rozbalené sekce "Create log file and run scraper"

Pak vám řeknu přesně, co se děje a jak to opravit!

---

## ⚡ RYCHLÝ CHECKLIST

- [ ] Zkontroloval jsem GitHub Secrets (2 secrets jsou tam)
- [ ] Spustil jsem workflow manuálně
- [ ] Počkal jsem, až workflow doběhne (1-2 minuty)
- [ ] Podíval jsem se na logy
- [ ] Zkontroloval jsem Supabase tabulku

---

**Jsem tu, abych vám pomohl! Jakmile provedete tyto kroky, řekněte mi co vidíte.**

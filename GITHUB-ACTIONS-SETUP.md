# GitHub Actions Setup - Automatické spouštění scraperu

Tento návod vám ukáže, jak nastavit automatické spouštění Sreality scraperu pomocí GitHub Actions.

## ✅ Co je už připraveno

Workflow soubor `.github/workflows/scraper.yml` je již vytvořen a nakonfigurován.

## 🔐 Nastavení GitHub Secrets

Abyste mohli používat GitHub Actions, musíte přidat tajné klíče do GitHubu:

### Krok 1: Otevřete GitHub repository
1. Jděte na váš GitHub repository ve webovém prohlížeči
2. Například: `https://github.com/VASE_JMENO/reality-v-kapse`

### Krok 2: Přejděte do Settings
1. Klikněte na **Settings** (záložka nahoře)
2. V levém menu klikněte na **Secrets and variables** > **Actions**

### Krok 3: Přidejte tajné klíče
Klikněte na **New repository secret** a přidejte tyto 2 secrets:

#### Secret 1: SUPABASE_URL
- **Name:** `SUPABASE_URL`
- **Value:** `https://xhjkjcrjfwhrzjackboa.supabase.co`
- Klikněte **Add secret**

#### Secret 2: SUPABASE_SERVICE_KEY
- **Name:** `SUPABASE_SERVICE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamtqY3JqZndocnpqYWNrYm9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc0NDM4OSwiZXhwIjoyMDc1MzIwMzg5fQ.ngfBTh9dzuK5JKwgRWBPJWP8Qj6npCo5GFrcibfPsn8`
- Klikněte **Add secret**

## 🚀 Spuštění scraperu

### Automatické spouštění
Scraper se automaticky spustí **každých 10 minut** po pushnutí do main větve.

### Manuální spuštění
1. Jděte na záložku **Actions** v GitHub repository
2. V levém menu klikněte na **Sreality Scraper**
3. Klikněte na **Run workflow** (vpravo nahoře)
4. Vyberte větev `main` a klikněte **Run workflow**

## 📊 Sledování výsledků

1. Jděte na záložku **Actions**
2. Klikněte na běžící workflow
3. Uvidíte live logy z scraperu
4. Po dokončení můžete vidět statistiky:
   - Kolik nemovitostí bylo zpracováno
   - Kolik bylo úspěšně uloženo
   - Případné chyby

## 🔧 Jak změnit frekvenci spouštění

V souboru `.github/workflows/scraper.yml` změňte řádek s `cron`:

```yaml
# Každých 10 minut (aktuální nastavení)
- cron: '*/10 * * * *'

# Každou hodinu
- cron: '0 * * * *'

# Každých 30 minut
- cron: '*/30 * * * *'

# Každý den v 8:00
- cron: '0 8 * * *'

# Každý den v 8:00 a 20:00
- cron: '0 8,20 * * *'
```

## ⚠️ Důležité poznámky

1. **GitHub Actions má limity:**
   - Veřejné repository: neomezené
   - Soukromé repository: 2000 minut/měsíc zdarma

2. **Každých 10 minut = ~4,320 spuštění/měsíc:**
   - Každé spuštění trvá ~1-2 minuty
   - Měsíční spotřeba: ~4,320-8,640 minut
   - Pro soukromé repo doporučujeme změnit na každou hodinu

3. **Sreality API:**
   - Buďte ohleduplní k jejich API
   - Scraper má zabudovanou 1 sekundovou pauzu mezi stránkami
   - Pokud dostanete rate limiting, zvyšte interval

## 🎉 Hotovo!

Po nastavení secrets a pushnutí změn do GitHubu bude scraper automaticky běžet a stahovat nejnovější nemovitosti ze Sreality.cz!

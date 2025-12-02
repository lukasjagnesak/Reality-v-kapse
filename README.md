# Reality v Kapse - Vibecode App

**🚀 APLIKACE JE PŘIPRAVENA NA BETA TEST!**

Aplikace pro vyhledávání nemovitostí s podporou různých metod autentizace a pokročilého porovnávání nemovitostí.

---

## 📖 QUICK START - Beta Test

**Chcete okamžitě otestovat aplikaci?**

👉 **Přečtěte si [BETA-TEST-SETUP.md](./BETA-TEST-SETUP.md)** - kompletní průvodce krok za krokem!

### Rychlé kroky:
1. ✅ Spustit 3 SQL skripty v Supabase (trvá 2 minuty)
2. ✅ Vypnout email confirmation
3. ✅ Restartovat aplikaci
4. ✅ Zaregistrovat se a testovat!

**15 testovacích nemovitostí** je připraveno k načtení!

### 🤖 Automatické stahování dat ze Sreality.cz

✅ **GitHub Actions jsou nastaveny a funkční!**

- Automaticky stahuje reálné nemovitosti ze Sreality.cz každých 10 minut
- Běží v cloudu pomocí GitHub Actions zdarma
- Data se ukládají přímo do Supabase
- Workflow lze spustit i manuálně přes GitHub UI (Actions tab → Sreality Scraper → Run workflow)

**Nastavené GitHub Secrets:**
- `EXPO_PUBLIC_SUPABASE_URL` ✅
- `SUPABASE_SERVICE_KEY` ✅
- `GH_PAT` (Personal Access Token) ✅

---

## Funkce

### Autentizace
- **Email/Heslo** - Klasická registrace a přihlášení přes Supabase
- **Apple Sign-In** - Přihlášení pomocí Apple ID (pouze iOS zařízení s podporou Apple Authentication)
- Zapomenuté heslo
- Debug mode pro rychlý přístup do aplikace (pro vývoj)

### Porovnávání Nemovitostí na Úrovni Microlokality
Aplikace umožňuje inteligentní porovnávání nemovitostí na úrovni **microlokality**:

**Automatické parsování lokace:**
- `"Praha 3, Žižkov"` → město: Praha, okres: Praha 3, microlokace: Žižkov
- `"Brno, Střed"` → město: Brno, microlokace: Střed
- `"Praha"` → město: Praha

**Porovnání v PropertyDetailScreen:**
- Zobrazení podobných nemovitostí v **téže microlokalitě** (např. všechny byty 2+kk v Žižkově)
- Statistiky:
  - Počet podobných nabídek v okolí
  - Průměrná cena za m² v microlokalitě
  - Vaše cena vs. průměr (se zelením/červeným označením)
  - Počet lepších nabídek
- **Cenové srovnání** - vizuální bar ukazující, kde se nemovitost nachází cenově oproti ostatním
- **Horizontální scroll** s 5 nejlevnějšími podobnými nemovitostmi
- Kliknutí na podobnou nemovitost otevře její detail

**Priorita srovnávání:**
1. **MicroLocation** - nejpřesnější (např. "Žižkov" vs "Vinohrady")
2. **District** - střední (např. "Praha 3")
3. **City** - nejširší (např. "Praha")

### Apple Sign-In
Apple Sign-In je k dispozici pouze na iOS zařízeních s iOS 13 a novějšími. Aplikace automaticky detekuje dostupnost této funkce a zobrazí tlačítko pouze pokud je podporováno.

**Konfigurace:**
- `app.json` obsahuje `ios.usesAppleSignIn: true` pro povolení Apple Sign-In capability
- `ios.bundleIdentifier` je nastaven na `com.vibecode.app`
- Pro produkční build je nutné nakonfigurovat Apple Developer účet a povolit Sign In with Apple capability

**Implementace:**
- Využívá `expo-apple-authentication` balíček
- Přihlášení probíhá přes Supabase s Apple ID tokenem
- Získává jméno a email uživatele (pokud uživatel povolí sdílení)

## Supabase Konfigurace

Pro plnou funkčnost Apple Sign-In je potřeba nakonfigurovat Supabase:

1. V Supabase Dashboard > Authentication > Providers
2. Povolit "Apple" providera
3. Přidat Service ID a další Apple konfigurace
4. Nastavit redirect URL

## Technické Detaily

- **Framework:** Expo SDK 53, React Native 0.76.7
- **Styling:** Nativewind (TailwindCSS)
- **Navigace:** React Navigation
- **State Management:** Zustand
- **Autentizace:** Supabase Auth s podporou Apple Sign-In
- **Backend:** Supabase

## Struktura Projektu

```
src/
├── screens/
│   ├── LoginScreen.tsx           # Přihlášení s Apple Sign-In
│   ├── RegisterScreen.tsx        # Registrace
│   ├── PropertyDetailScreen.tsx  # Detail nemovitosti s porovnáním microlokality
│   └── ...
├── api/
│   ├── supabase.ts              # Supabase konfigurace
│   ├── realtyService.ts         # Načítání nemovitostí z Supabase
│   └── googleSheetsService.ts   # Fallback na Google Sheets
├── navigation/
│   └── AppNavigator.tsx         # Navigační struktura
├── state/
│   └── propertyStore.ts         # Globální state
└── utils/
    └── propertyUtils.ts         # Utility funkce včetně parseLocation a getMicroLocationComparison
```

## Poslední změny

- ✅ **GitHub Actions scraper nastaveny a spuštěny!**
- ✅ Automatické stahování nemovitostí ze Sreality.cz každých 10 minut
- ✅ Supabase secrets nakonfigurovány v GitHub repository
- ✅ Přidána podpora Apple Sign-In
- ✅ Automatická detekce dostupnosti Apple Sign-In na zařízení
- ✅ Integrace s Supabase authentication
- ✅ Stylové Apple Sign-In tlačítko dle Apple Human Interface Guidelines
- ✅ **Porovnávání nemovitostí na úrovni microlokality**
- ✅ **Automatické parsování lokace** (město, okres, microlokace)
- ✅ **Vizuální cenové srovnání** s grafem a statistikami
- ✅ **Horizontální scroll podobných nemovitostí** v microlokalitě

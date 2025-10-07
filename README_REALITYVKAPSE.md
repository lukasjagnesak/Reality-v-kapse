# Reality v Kapse 🏠

Mobilní aplikace pro iPhone a iPad pro sledování výhodných nabídek nemovitostí z českých realitních serverů.

## Popis

Reality v Kapse je aplikace, která skenuje realitní servery (sreality.cz, bezrealitky.cz, annonce.cz) a upozorňuje uživatele na nemovitosti, které splňují jejich kritéria a jsou výhodně oceněné oproti průměru v dané lokalitě.

### Hlavní funkce

- 🔍 **Sledování realitních serverů** - Sreality.cz, Bezrealitky.cz, Annonce.cz
- 🎯 **Personalizovaná kritéria** - Lokalita, typ nemovitosti, dispozice, cenové rozmezí
- 📊 **Hodnocení nabídek** - Systém hodnocení C, B, A, A+ podle výhodnosti ceny
- 💰 **Kalkulátor hypotéky** - Okamžitý výpočet měsíční splátky
- ❤️ **Oblíbené** - Ukládání zajímavých nemovitostí
- 🔔 **Push notifikace** - Upozornění na nové výhodné nabídky
- 👤 **Uživatelský profil** - Správa účtu a předplatného
- 💎 **Předplatné** - 4 úrovně předplatného (Free, Basic, Premium, Pro)

## Technologie

- **React Native 0.79.2** s Expo SDK 53
- **TypeScript** pro type safety
- **Zustand** pro state management s AsyncStorage persistence
- **React Navigation** pro native navigaci
- **NativeWind (Tailwind)** pro styling
- **Expo Notifications** pro push notifikace (připraveno)

## Struktura projektu

```
src/
├── api/
│   ├── mockData.ts           # Mock data pro vývoj
│   └── realtyService.ts      # API služba pro scraping (připraveno)
├── components/
│   ├── Badges.tsx            # Rating a Discount badges
│   └── PropertyCard.tsx      # Karta nemovitosti
├── navigation/
│   └── AppNavigator.tsx      # Navigační struktura s bottom tabs
├── screens/
│   ├── OnboardingScreen.tsx       # Úvodní nastavení kritérií
│   ├── PropertiesScreen.tsx       # Hlavní feed s nabídkami
│   ├── CriteriaScreen.tsx         # Nastavení kritérií hledání
│   ├── ProfileScreen.tsx          # Uživatelský profil a předplatné
│   ├── PropertyDetailScreen.tsx   # Detail nemovitosti
│   └── FavoritesScreen.tsx        # Oblíbené nemovitosti
├── state/
│   ├── propertyStore.ts      # Zustand store pro nemovitosti
│   └── userStore.ts          # Zustand store pro uživatele
├── types/
│   ├── property.ts           # TypeScript typy pro nemovitosti
│   └── user.ts               # TypeScript typy pro uživatele
└── utils/
    └── propertyUtils.ts      # Utility funkce
```

## Systém hodnocení

Aplikace hodnotí nemovitosti na základě porovnání ceny za m² s průměrem v dané lokalitě:

- **A+** - Sleva 15% a více (zelená)
- **A** - Sleva 10-15% (modrá)
- **B** - Sleva 5-10% (oranžová)
- **C** - Sleva 0-5% (červená)

## Předplatné

Aplikace nabízí 4 úrovně předplatného:

### Free (Zdarma)
- Sledování 1 lokality
- Až 10 oblíbených nemovitostí
- Základní filtrování

### Basic (99 Kč/měsíc)
- Sledování 3 lokalit
- Až 50 oblíbených nemovitostí
- Push notifikace
- Pokročilé filtrování

### Premium (199 Kč/měsíc)
- Sledování 10 lokalit
- Neomezené oblíbené
- Push notifikace
- Cenové upozornění
- Analýza trhu

### Pro (399 Kč/měsíc)
- Neomezené lokality
- Neomezené oblíbené
- Prioritní notifikace
- Pokročilá analýza trhu
- Export dat
- API přístup

## Navigace

Aplikace používá **bottom tab navigaci** se třemi hlavními záložkami:

1. **Nemovitosti** 🏠 - Seznam nemovitostí splňujících vaše kritéria
2. **Kritéria** ⚙️ - Nastavení kritérií pro vyhledávání
3. **Nastavení** 👤 - Uživatelský profil a správa předplatného

## Spuštění aplikace

```bash
# Instalace závislostí
bun install

# Spuštění dev serveru
bun start

# Spuštění na iOS
bun ios

# Spuštění na Android
bun android
```

## Budoucí implementace

### Backend požadavky

Pro plnou funkcionalitu je potřeba implementovat backend server, který bude:

1. **Scraping realitních serverů**
   - Pravidelné skenování sreality.cz, bezrealitky.cz, annonce.cz
   - Ukládání inzerátů do databáze
   - Sledování změn a nových nabídek

2. **Analýza trhu**
   - Výpočet průměrných cen za m² podle lokality
   - Historická data pro lepší analýzu
   - Machine learning pro predikci cen

3. **Push notifikace**
   - Expo Push Notification service
   - Filtrování nabídek podle uživatelských preferencí
   - Okamžité notifikace při nalezení výhodné nabídky

4. **API Endpoints**
   ```
   GET /api/properties - Získání nemovitostí
   GET /api/properties/:id - Detail nemovitosti
   POST /api/preferences - Uložení preferencí
   GET /api/market-stats - Tržní statistiky
   POST /api/notifications/register - Registrace pro notifikace
   ```

### Technické poznámky

- Web scraping nelze provádět přímo z mobilní aplikace (CORS, rate limiting)
- Doporučený stack pro backend: Node.js + Express + PostgreSQL + Redis
- Pro scraping: Puppeteer nebo Playwright
- Cron jobs pro pravidelnou aktualizaci dat
- Rate limiting pro ochranu realitních serverů

## Design

Design je inspirován aplikací Investown.cz s důrazem na:
- Čistý, moderní vzhled
- Velké, čitelné fonty
- Intuitivní navigace
- Barevné odlišení hodnocení
- Native iOS komponenty

## Autor

Vytvořeno pro účely sledování realitního trhu v České republice.

## Licence

Privátní projekt

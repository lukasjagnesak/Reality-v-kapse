# Reality v Kapse 🏠

Mobilní aplikace pro iPhone a iPad pro sledování výhodných nabídek nemovitostí z českých realitních serverů.

## Popis

Reality v Kapse je aplikace, která skenuje realitní servery (sreality.cz, bezrealitky.cz, annonce.cz) a upozorňuje uživatele na nemovitosti, které splňují jejich kritéria a jsou výhodně oceněné oproti průměru v dané lokalitě.

### Hlavní funkce

- 🔍 **Sledování realitních serverů** - Sreality.cz, Bezrealitky.cz, Annonce.cz
- 🎯 **Personalizované preference** - Lokalita, typ nemovitosti, dispozice, cenové rozmezí
- 📊 **Hodnocení nabídek** - Systém hodnocení C, B, A, A+ podle výhodnosti ceny
- 💰 **Kalkulátor hypotéky** - Okamžitý výpočet měsíční splátky
- ❤️ **Oblíbené** - Ukládání zajímavých nemovitostí
- 🔔 **Push notifikace** - Upozornění na nové výhodné nabídky

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
├── navigation/
│   └── AppNavigator.tsx      # Navigační struktura
├── screens/
│   ├── OnboardingScreen.tsx  # Úvodní nastavení preferencí
│   ├── HomeScreen.tsx        # Hlavní feed s nabídkami
│   ├── PropertyDetailScreen.tsx  # Detail nemovitosti
│   ├── SettingsScreen.tsx    # Nastavení preferencí
│   └── FavoritesScreen.tsx   # Oblíbené nemovitosti
├── state/
│   └── propertyStore.ts      # Zustand store
├── types/
│   └── property.ts           # TypeScript typy
└── utils/
    └── propertyUtils.ts      # Utility funkce
```

## Systém hodnocení

Aplikace hodnotí nemovitosti na základě porovnání ceny za m² s průměrem v dané lokalitě:

- **A+** - Sleva 15% a více (zelená)
- **A** - Sleva 10-15% (modrá)
- **B** - Sleva 5-10% (oranžová)
- **C** - Sleva 0-5% (červená)

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

# Reality v Kapse - Vibecode App

Aplikace pro vyhledávání nemovitostí s podporou různých metod autentizace.

## Funkce

### Autentizace
- **Email/Heslo** - Klasická registrace a přihlášení přes Supabase
- **Apple Sign-In** - Přihlášení pomocí Apple ID (pouze iOS zařízení s podporou Apple Authentication)
- Zapomenuté heslo
- Debug mode pro rychlý přístup do aplikace (pro vývoj)

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
│   ├── LoginScreen.tsx      # Přihlášení s Apple Sign-In
│   ├── RegisterScreen.tsx   # Registrace
│   └── ...
├── api/
│   └── supabase.ts         # Supabase konfigurace
├── navigation/
│   └── AppNavigator.tsx    # Navigační struktura
└── state/
    └── propertyStore.ts    # Globální state
```

## Poslední změny

- ✅ Přidána podpora Apple Sign-In
- ✅ Automatická detekce dostupnosti Apple Sign-In na zařízení
- ✅ Integrace s Supabase authentication
- ✅ Stylové Apple Sign-In tlačítko dle Apple Human Interface Guidelines

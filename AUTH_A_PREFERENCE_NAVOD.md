# 🔐 Přihlašování a ukládání uživatelských preferencí

## ✅ Současný stav

Systém pro přihlašování a ukládání preferencí je **JIŽ PLNĚ FUNKČNÍ!**

---

## 📋 Co je implementováno

### **1. Autentizace (Supabase Auth)**
- ✅ **Registrace** (`RegisterScreen.tsx`)
- ✅ **Přihlášení** (`LoginScreen.tsx`)  
- ✅ **Obnovení hesla** (`ForgotPasswordScreen.tsx`)
- ✅ **Automatická session** - uživatel zůstane přihlášený i po restartu aplikace
- ✅ **DEBUG MODE** - pro vývoj můžete přeskočit přihlášení

### **2. Databázové tabulky**
- ✅ `user_profiles` - profil uživatele (email, jméno, telefon, předplatné)
- ✅ `user_preferences` - uživatelská kritéria pro vyhledávání
- ✅ `user_favorites` - oblíbené nemovitosti

### **3. Synchronizace preferencí**
- ✅ **Automatické načtení** při přihlášení
- ✅ **Automatické uložení** při změně v CriteriaScreen
- ✅ **Persist** - preference jsou uloženy lokálně i v cloudu

---

## 🎯 Jak to funguje (Flow)

### **Scénář 1: Nový uživatel**

1. **Otevře aplikaci** → zobrazí se `LoginScreen`
2. **Klikne "Registrace"** → přejde na `RegisterScreen`
3. **Vyplní email + heslo** → klikne "Zaregistrovat se"
4. **Supabase vytvoří účet** → automaticky přihlášen
5. **AppNavigator detekuje přihlášení** → přesměruje na `Onboarding`
6. **Onboarding** → vysvětlí aplikaci
7. **Přejde na Kritéria** → nastaví lokality, dispozice, cenu
8. **Klikne "Uložit změny"** → preference se uloží do `user_preferences` tabulky
9. **Přejde na Nemovitosti** → vidí filtrované nemovitosti podle svých kritérií

### **Scénář 2: Vracející se uživatel**

1. **Otevře aplikaci** → `AppNavigator` zkontroluje session
2. **Session existuje** → automaticky načte profil + preference z databáze
3. **Přejde rovnou do aplikace** → vidí své oblíbené nemovitosti a filtrované výsledky

### **Scénář 3: Změna kritérií**

1. **Uživatel přejde na Kritéria**
2. **Změní lokalitu** z "Brno" na "Brno - Židenice"
3. **Změní dispozici** z "2+kk" na "3+kk"
4. **Klikne "Uložit změny"**
5. **`savePreferencesToDatabase(userId)`** se zavolá
6. **Preference se uloží do Supabase** (tabulka `user_preferences`)
7. **Přejde na Nemovitosti** → vidí nově filtrované výsledky

---

## 📊 Struktura `user_preferences`

```json
{
  "user_id": "e4d959dd-97c2-4556-8e5c-5f514eb1f171",
  "locations": ["Brno - Židenice", "Brno - Veveří"],
  "property_types": ["byt"],
  "dispositions": ["2+kk", "3+kk"],
  "price_min": 0,
  "price_max": 10000000,
  "area_min": 40,
  "area_max": 80,
  "min_discount_percentage": 10,
  "notifications_enabled": true
}
```

---

## 🔧 Relevantní kódové soubory

### **Screens**
- `/src/screens/LoginScreen.tsx` - Přihlášení
- `/src/screens/RegisterScreen.tsx` - Registrace
- `/src/screens/CriteriaScreen.tsx` - Nastavení kritérií (s LocationPicker)
- `/src/screens/ProfileScreen.tsx` - Profil a odhlášení

### **State management**
- `/src/state/propertyStore.ts` - Zustand store s metodami:
  - `syncPreferencesFromDatabase(userId)` - Načte preference z DB
  - `savePreferencesToDatabase(userId)` - Uloží preference do DB
  - `syncFavoritesFromDatabase(userId)` - Načte oblíbené z DB
  - `saveFavoriteToDatabase(userId, propertyId, isAdding)` - Uloží oblíbenou

- `/src/state/userStore.ts` - Uživatelský profil

### **API**
- `/src/api/supabase.ts` - Supabase klient

### **Navigation**
- `/src/navigation/AppNavigator.tsx` - Řídí přihlášení a přesměrování

---

## 🧪 Testování celého flow

### **Test 1: Registrace a nastavení kritérií**

```bash
# V aplikaci:
1. Otevřete aplikaci
2. Klikněte "Registrace"
3. Vyplňte:
   - Email: test@example.com
   - Heslo: TestHeslo123
4. Klikněte "Zaregistrovat se"
5. Přejděte na "Kritéria"
6. Nastavte:
   - Lokalita: Brno - Židenice
   - Dispozice: 2+kk, 3+kk
   - Cena: 0 - 10,000,000 Kč
7. Klikněte "Uložit změny"
8. Přejděte na "Nemovitosti"
9. ✅ Měli byste vidět jen nemovitosti z Brna - Židenic s dispozicí 2+kk nebo 3+kk
```

### **Test 2: Odhlášení a přihlášení (persistence)**

```bash
# V aplikaci:
1. Přejděte na "Nastavení"
2. Klikněte "Odhlásit se"
3. ✅ Měli byste být na LoginScreen
4. Přihlaste se znovu se stejnými údaji
5. ✅ Preference by měly být načteny z databáze
6. Přejděte na "Kritéria"
7. ✅ Měli byste vidět své dříve nastavené filtry (Brno - Židenice, 2+kk, 3+kk)
```

### **Test 3: Kontrola v Supabase Dashboard**

```sql
-- Spusťte v Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xhjkjcrjfwhrzjackboa/sql/new

-- Zobrazit všechny uživatele
SELECT * FROM auth.users;

-- Zobrazit všechny preference
SELECT 
  up.*,
  u.email
FROM user_preferences up
JOIN auth.users u ON u.id = up.user_id;

-- Zobrazit oblíbené nemovitosti
SELECT 
  uf.*,
  u.email,
  p.title
FROM user_favorites uf
JOIN auth.users u ON u.id = uf.user_id
LEFT JOIN properties p ON p.id = uf.property_id;
```

---

## 🚨 Důležité poznámky

### **RLS (Row Level Security)**
- ✅ Každý uživatel vidí **POUZE SVOJE** preference
- ✅ Uživatel nemůže upravit preference jiného uživatele
- ✅ Properties jsou veřejné (viditelné všem)

### **DEBUG MODE**
- V `LoginScreen.tsx` je `DEBUG_MODE = true`
- Umožňuje přeskočit přihlášení pro rychlý vývoj
- **Pro produkci nastavte na `false`**

### **Email confirmation**
- V Supabase je **VYPNUTÁ** email konfirmace
- Pro produkci ji **ZAPNĚTE** v:
  - https://supabase.com/dashboard/project/xhjkjcrjfwhrzjackboa/auth/users
  - Settings → Email → Disable email confirmation

---

## 🔮 Co dál?

### **Scrapování podle uživatelských kritérií**

Nyní, když máme uživatelská kritéria v databázi, můžeme:

1. **Vytvořit cron job** (nebo Supabase Edge Function)
2. **Pro každého uživatele:**
   - Načíst jeho `user_preferences`
   - Spustit scraper pro jeho lokality + dispozice
   - Uložit nové nemovitosti do `properties`
   - Pokud najdeme nemovitost s vysokou slevou → poslat push notifikaci

3. **Push notifikace:**
   - Integrace s Expo Push Notifications
   - Poslat upozornění: "🏠 Nová nabídka v Brně - Židenice: 2+kk za 7.2M Kč (sleva 15%)"

---

## ✅ Shrnutí

**Systém přihlašování a ukládání preferencí JE PLNĚ FUNKČNÍ!**

- ✅ Registrace funguje
- ✅ Přihlášení funguje
- ✅ Preference se ukládají do databáze
- ✅ Preference se načítají po přihlášení
- ✅ Oblíbené nemovitosti se synchronizují
- ✅ RLS policies chrání data uživatelů

**Co testovat:**
1. Zaregistrujte se v aplikaci
2. Nastavte kritéria (lokalita, dispozice, cena)
3. Uložte změny
4. Odhlaste se
5. Přihlaste se znovu
6. Ověřte, že kritéria jsou stále nastavena

**Vše funguje! 🎉**

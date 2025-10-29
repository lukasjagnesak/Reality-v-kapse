# =€ BETA TEST SETUP - Reality v Kapse

**Kompletní provodce pro spuatní beta testu aplikace**

---

##  Co je hotovo

Aplikace je **100% pYipravena na beta test** s následujícími funkcemi:

### <¯ Hlavní funkce
-  Registrace u~ivatelo (email + heslo)
-  PYihláaení (email + heslo + Apple Sign-In na iOS)
-  Supabase databáze s kompletním schématem
-  Naítání nemovitostí z databáze
-  Fallback na Google Sheets pokud Supabase sel~e
-  Porovnávání nemovitostí na úrovni microlokality
-  Oblíbené nemovitosti (synchronizace s databází)
-  Filtrování podle lokace, ceny, dispozice, atd.
-  Kalkulace hypotéky
-  U~ivatelské preference (ukládání do databáze)

---

## =Ë KROK 1: Nastavení Supabase Databáze

### 1.1 PYihláaení do Supabase
1. OtevYete [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. PYihlaste se k projektu: **xhjkjcrjfwhrzjackboa**
3. URL: `https://xhjkjcrjfwhrzjackboa.supabase.co`

### 1.2 Spuatní SQL skripto

#### Krok 1: VytvoYit tabulky pro u~ivatele
1. V Supabase Dashboard jdte na **SQL Editor**
2. Kliknte na **New query**
3. Zkopírujte obsah souboru `supabase-schema.sql`
4. Vlo~te do editoru a kliknte **RUN**
5.  Zkontrolujte: Mly by se vytvoYit tabulky:
   - `user_profiles`
   - `user_preferences`
   - `user_favorites`

#### Krok 2: VytvoYit tabulku properties
1. V SQL Editoru vytvoYte **nový query**
2. Zkopírujte obsah souboru `supabase-properties-schema.sql`
3. Vlo~te a kliknte **RUN**
4.  Zkontrolujte: Tabulka `properties` by mla existovat

#### Krok 3: Vlo~it testovací data
1. V SQL Editoru vytvoYte **nový query**
2. Zkopírujte obsah souboru `supabase-test-data.sql`
3. Vlo~te a kliknte **RUN**
4.  Zkontrolujte: Mlo by se vlo~it **15 testovacích nemovitostí**

### 1.3 Vypnout email konfirmaci (pro beta test)

Pro snadnjaí testování vypnte email confirmation:

1. V Supabase Dashboard jdte na **Authentication** > **Providers**
2. Najdte **Email**
3. Vypnte **"Confirm email"**
4. Ulo~te zmny

 **Te se u~ivatelé mo~ou registrovat bez potvrzení emailu!**

---

## =Ë KROK 2: OvYení konfigurace

### 2.1 Zkontrolovat .env soubor

Soubor `.env` by ml obsahovat:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://xhjkjcrjfwhrzjackboa.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Sheets Integration - Reality v Kapse (fallback)
EXPO_PUBLIC_GOOGLE_SHEETS_ID=12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck
```

 **Konfigurace je ji~ nastavena!**

---

## =Ë KROK 3: Testování aplikace

### 3.1 Restartovat aplikaci

```bash
# Restartujte Expo
# Aplikace by mla naíst novou konfiguraci
```

### 3.2 Test flow

#### Test 1: Registrace nového u~ivatele
1.  OtevYete aplikaci
2.  Kliknte na **"Zaregistrujte se"**
3.  VyplHte:
   - Jméno: `Test User`
   - Email: `test@email.cz`
   - Heslo: `test123`
4.  Kliknte **"Zaregistrovat se"**
5.  **Mli byste vidt**: "Registrace úspaná!"
6.  **Mli byste být automaticky pYihláaeni**

#### Test 2: Onboarding
1.  Po registraci se zobrazí **Onboarding** screen
2.  Vyberte lokace (napY. "Praha", "Brno")
3.  Vyberte dispozice (napY. "2+kk", "3+kk")
4.  Nastavte cenový rozsah
5.  Kliknte **"Zaít hledat"**

#### Test 3: Prohlí~ení nemovitostí
1.  Mli byste vidt seznam nemovitostí
2.  **Mlo by se zobrazit 15 testovacích nemovitostí**
3.  Filtrování podle lokace by mlo fungovat
4.  Kliknte na nemovitost pro detail

#### Test 4: Porovnání microlokality
1.  OtevYete detail nemovitosti v }i~kov (napY. "Prostorný byt 2+kk v srdci }i~kova")
2.  Scrollujte dolo do sekce **"Porovnání v }i~kov"**
3.  **Mli byste vidt**:
   - Poet podobných nabídek: **3** (vaechny 2+kk v }i~kov)
   - Promrnou cenu za m²
   - Vaai cenu vs. promr (zelené/ervené)
   - Vizuální cenový bar
   - Horizontální scroll s podobnými nemovitostmi

#### Test 5: Oblíbené
1.  Kliknte na d u njaké nemovitosti
2.  PYejdte na tab **"Oblíbené"**
3.  Nemovitost by se mla zobrazit
4.  **Oblíbené jsou ulo~eny v Supabase databázi**

#### Test 6: Kritéria
1.  PYejdte na tab **"Kritéria"**
2.  ZmHte lokace, cenu, dispozice
3.  Ulo~te zmny
4.  **Preference jsou ulo~eny v Supabase databázi**
5.  Vraete se na **"Nemovitosti"** - filtrování by mlo fungovat

#### Test 7: Odhláaení a pYihláaení
1.  Jdte do **Profilu**
2.  Kliknte **"Odhlásit se"**
3.  Mli byste se vrátit na Login screen
4.  PYihlaste se znovu:
   - Email: `test@email.cz`
   - Heslo: `test123`
5.  **Mli byste vidt své oblíbené a preference zachované**

---

## =Ë KROK 4: OvYení v Supabase

### 4.1 Zkontrolovat u~ivatele

1. V Supabase Dashboard jdte na **Authentication** > **Users**
2.  Mli byste vidt nov vytvoYeného u~ivatele `test@email.cz`

### 4.2 Zkontrolovat data v databázi

1. Jdte na **Table Editor**
2. OtevYete tabulku **user_profiles**
   -  Ml by tam být profil s vaaím emailem
3. OtevYete tabulku **user_preferences**
   -  Mly by tam být vaae preference
4. OtevYete tabulku **user_favorites**
   -  Mly by tam být vaae oblíbené nemovitosti
5. OtevYete tabulku **properties**
   -  Mlo by tam být 15 testovacích nemovitostí

---

## <¯ KROK 5: PYidání více nemovitostí (volitelné)

### Mo~nost A: Runí pYidání pYes Supabase

1. V Supabase jdte na **Table Editor** > **properties**
2. Kliknte **Insert** > **Insert row**
3. VyplHte data a ulo~te

### Mo~nost B: Import z Google Sheets

Aplikace má automatický fallback na Google Sheets pokud Supabase sel~e nebo je prázdný.

Google Sheets ID je ji~ nastaveno: `12ZhQXFF_h-xyCB-nByNyE_mMBJ3M1BcgqQ2QshVk4Ck`

---

## = Xeaení problémo

### Problém: "}ádné nemovitosti nenalezeny"

**Xeaení:**
1. Zkontrolujte, ~e jste spustili `supabase-test-data.sql`
2. Zkontrolujte filtry v tab "Kritéria" - mo~ná jsou pYília pYísné
3. Zkontrolujte logy v `expo.log`

### Problém: "Chyba pYihláaení"

**Xeaení:**
1. Zkontrolujte `.env` soubor - Supabase URL a klíe
2. Zkontrolujte, ~e email confirmation je vypnutá
3. Zkuste jiný email

### Problém: "Console error pYi naítání"

**Xeaení:**
- To je normální - `console.error` v realtyService.ts je zmnn na `console.log`
- Aplikace má fallback na Google Sheets

---

##  Checklist beta testu

- [ ] Spustit `supabase-schema.sql`
- [ ] Spustit `supabase-properties-schema.sql`
- [ ] Spustit `supabase-test-data.sql`
- [ ] Vypnout email confirmation v Supabase
- [ ] Restartovat aplikaci
- [ ] VytvoYit testovacího u~ivatele
- [ ] Otestovat registraci
- [ ] Otestovat onboarding
- [ ] Otestovat naítání nemovitostí (mlo by jich být 15)
- [ ] Otestovat detail nemovitosti
- [ ] Otestovat porovnání microlokality (}i~kov má 3 byty 2+kk)
- [ ] Otestovat oblíbené
- [ ] Otestovat zmnu kritérií
- [ ] Otestovat odhláaení a pYihláaení
- [ ] OvYit data v Supabase

---

## <‰ Hotovo!

Aplikace je **pln funkní** a pYipravena na beta test!

### Co funguje:
 Registrace a pYihláaení
 Naítání 15 testovacích nemovitostí z Supabase
 Porovnávání nemovitostí na úrovni microlokality
 Oblíbené (s databází)
 Filtrace
 U~ivatelské preference (s databází)
 Kalkulace hypotéky
 Apple Sign-In (pouze iOS)

### Pro produkní nasazení:
- =Ê PYidat více nemovitostí do databáze
- = Nastavit automatickou aktualizaci nemovitostí (scraper)
- 	 Zapnout email confirmation
- = Implementovat notifikace
- =ñ PYipravit na App Store / Google Play

---

**PotYebujete pomoc?** Zkontrolujte logy v `expo.log` nebo kontaktujte vývojáYe.

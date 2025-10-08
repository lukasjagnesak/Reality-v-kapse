# 🔧 NÁVOD: Jak opravit Supabase autentizaci

## ❌ Aktuální problémy:

1. ✅ **Supabase URL funguje** - připojení je OK
2. ❌ **Databázové tabulky neexistují** - SQL schema nebylo spuštěno
3. ⚠️  **Email validace** - test použil neplatný email

---

## 📋 KROK ZA KROKEM - CO UDĚLAT:

### **KROK 1: Spustit SQL schema v Supabase** 🔴 **NUTNÉ!**

1. Otevřete [Supabase Dashboard](https://supabase.com/dashboard/project/xhjkjcrjfwhrzjackboa)
2. V levém menu klikněte na **"SQL Editor"**
3. Klikněte na **"New query"** (zelené tlačítko)
4. Zkopírujte CELÝ obsah souboru `supabase-schema.sql` (v kořenové složce projektu)
5. Vložte ho do SQL editoru
6. Klikněte na **"Run"** nebo stiskněte `Ctrl+Enter`
7. Měli byste vidět: ✅ "Success. No rows returned"

To vytvoří:
- ✅ Tabulku `user_profiles`
- ✅ Tabulku `user_preferences`
- ✅ Tabulku `user_favorites`
- ✅ Automatické triggery
- ✅ Row Level Security policies

---

### **KROK 2: Vypnout email konfirmaci** (volitelné, ale doporučené)

1. V Supabase Dashboard jděte na **"Authentication"** → **"Settings"**
2. Najděte sekci **"Email Auth"**
3. Vypněte **"Enable email confirmations"**
4. Klikněte **"Save"**

Tím umožníte uživatelům se registrovat bez nutnosti klikat na link v emailu.

---

### **KROK 3: Otestovat aplikaci**

1. V aplikaci klikněte na oranžové tlačítko **"🐛 DEBUG: Přeskočit přihlášení"**
2. Zvolte **"Přeskočit do aplikace"**
3. Aplikace by měla fungovat s 210 nemovitostmi

---

### **KROK 4: Otestovat registraci** (až po KROKU 1)

1. V aplikaci jděte na **"Zaregistrujte se"**
2. Zadejte:
   - Celé jméno: "Test Uživatel"
   - Email: "test@test.cz" (nebo jakýkoli platný email)
   - Heslo: "test123456"
   - Potvrdit heslo: "test123456"
3. Klikněte **"Zaregistrovat se"**
4. Pokud vše funguje, měli byste:
   - ✅ Vidět hlášku "Registrace úspěšná"
   - ✅ Automaticky se přesměrovat na Onboarding
   - ✅ V konzoli vidět: "✅ Registrace úspěšná, user: [nějaké-id]"

---

## 🐛 DEBUG MODE

V LoginScreen je nyní **oranžové tlačítko "DEBUG: Přeskočit přihlášení"**, které umožní:
- Přeskočit na Onboarding
- Přeskočit přímo do aplikace
- Otestovat aplikaci bez nutnosti mít funkční Supabase

**Po opravě Supabase můžete DEBUG MODE vypnout:**
```typescript
// V src/screens/LoginScreen.tsx na řádku 14:
const DEBUG_MODE = false; // změnit na false
```

---

## 📊 Jak zkontrolovat, že SQL schema fungovalo:

1. Jděte do Supabase Dashboard → **"Table Editor"**
2. V levém menu byste měli vidět:
   - ✅ `user_profiles`
   - ✅ `user_preferences`
   - ✅ `user_favorites`
3. Klikněte na `user_profiles` - měla by být prázdná tabulka se sloupci: `id`, `email`, `full_name`, `phone`, `subscription_type`, atd.

---

## 🔍 Jak sledovat, co se děje:

V konzoli (Metro bundler) uvidíte barevné logy:
- 🔵 `Začínám registraci...` - když kliknete na registrovat
- ✅ `Registrace úspěšná` - když to funguje
- ❌ `Chyba registrace` - když to nefunguje
- 🔐 `Auth state změna: SIGNED_IN` - když se přihlásíte

---

## ⚠️ Časté problémy:

### "Email address invalid"
- Použijte platný email formát: `jmeno@domena.cz`
- Test email `test@example.com` nefunguje

### "User already registered"
- Email už existuje v databázi
- Použijte jiný email nebo smažte uživatele v Supabase → Authentication

### Aplikace se zasekne na login screen
- Použijte DEBUG tlačítko pro přeskočení
- Zkontrolujte konzoli pro chybové hlášky
- Ověřte, že SQL schema bylo spuštěno

---

## 🎯 Shrnutí:

1. **NEJDŘÍV** spusťte SQL schema v Supabase (KROK 1)
2. Pak otestujte registraci v aplikaci
3. Pokud nefunguje, použijte DEBUG mode
4. Sledujte konzoli pro detailní chybové hlášky

---

## 📞 Co vidíte v konzoli teď:

Když zkusíte registraci, měli byste vidět:
```
🔵 Začínám registraci...
📊 Supabase odpověď: { data: {...}, error: null }
✅ Registrace úspěšná, user: abc-123-def
✅ Session vytvořena, přihlášení úspěšné
```

Nebo když to nefunguje:
```
🔵 Začínám registraci...
📊 Supabase odpověď: { data: null, error: {...} }
❌ Supabase error: [detailní chyba]
```

Toto vám řekne přesně, kde je problém!

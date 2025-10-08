# ⚡ RYCHLÝ NÁVOD - Co udělat TEĎ

## 🎯 Vaše aplikace má 2 problémy:

### 1. ❌ Databázové tabulky neexistují
**ŘEŠENÍ:** Spustit SQL v Supabase

### 2. ⚠️ Email konfirmace je zapnutá
**ŘEŠENÍ:** Vypnout v Supabase nastavení

---

## 📋 CO UDĚLAT (5 minut):

### **KROK 1: Spustit SQL schema** 🔴

1. Otevřete: https://supabase.com/dashboard/project/xhjkjcrjfwhrzjackboa/sql/new
2. Otevřete soubor `supabase-schema.sql` v editoru
3. Zkopírujte CELÝ obsah (Ctrl+A, Ctrl+C)
4. Vložte do Supabase SQL editoru (Ctrl+V)
5. Klikněte **"RUN"** (nebo Ctrl+Enter)
6. Měli byste vidět: ✅ "Success. No rows returned"

### **KROK 2: Vypnout email konfirmaci** ⚠️

1. Otevřete: https://supabase.com/dashboard/project/xhjkjcrjfwhrzjackboa/auth/settings
2. Najděte **"Enable email confirmations"**
3. Vypněte (toggle OFF)
4. Klikněte **"Save"**

---

## 🧪 Jak otestovat, že to funguje:

### **Varianta A: DEBUG mode (bez Supabase)**
1. V aplikaci klikněte oranžové tlačítko **"🐛 DEBUG: Přeskočit přihlášení"**
2. Zvolte **"Přeskočit do aplikace"**
3. Aplikace by měla fungovat ✅

### **Varianta B: Plná registrace (po KROK 1 a 2)**
1. V aplikaci klikněte **"Zaregistrujte se"**
2. Vyplňte:
   - Jméno: "Jan Novák"
   - Email: "jan@test.cz"
   - Heslo: "heslo123"
3. Klikněte **"Zaregistrovat se"**
4. Měli byste vidět: ✅ "Registrace úspěšná"
5. Automaticky se přesměrujete na Onboarding

---

## 🔍 Jak poznám, že SQL schema fungovalo?

Po spuštění SQL:
1. V Supabase jděte na **"Table Editor"**
2. V levém menu uvidíte:
   ```
   ├── user_profiles      ← tady klikněte
   ├── user_preferences
   └── user_favorites
   ```
3. Měli byste vidět prázdnou tabulku se sloupci

---

## ⚡ TLDR;

```
1. SQL schema v Supabase → RUN ✅
2. Email confirmations → OFF ⚠️
3. Kliknout DEBUG tlačítko v aplikaci 🐛
```

**Hotovo!** 🎉

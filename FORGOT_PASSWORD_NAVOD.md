# 🔐 Funkce "Zapomenuté heslo" - Dokumentace

## ✅ Co bylo přidáno:

### 1. **Nový screen: ForgotPasswordScreen**
- Nachází se v: `/src/screens/ForgotPasswordScreen.tsx`
- Umožňuje uživatelům obnovit zapomenuté heslo

### 2. **Odkaz na Login screenu**
- Přidán link "Zapomněli jste heslo?" pod přihlašovacím formulářem
- Naviguje na ForgotPasswordScreen

### 3. **Route v AppNavigator**
- Přidána route `ForgotPassword` do navigace

---

## 🎯 Jak to funguje:

### **Z pohledu uživatele:**

1. **Uživatel zapomene heslo:**
   - Na login screenu klikne na **"Zapomněli jste heslo?"**

2. **Zadá svůj email:**
   - Aplikace ověří formát emailu
   - Klikne na **"Odeslat odkaz"**

3. **Dostane email:**
   - Supabase pošle email s odkazem pro reset hesla
   - Email obsahuje unikátní link platný 1 hodinu

4. **Klikne na odkaz v emailu:**
   - Otevře se webové rozhraní Supabase
   - Zadá nové heslo
   - Potvrdí nové heslo

5. **Vrátí se do aplikace:**
   - Přihlásí se s novým heslem ✅

---

## 🔧 Technické detaily:

### **Supabase metoda:**
```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'reality-v-kapse://reset-password',
});
```

### **Co se děje na pozadí:**
1. Supabase kontroluje, jestli email existuje
2. Pokud ano, pošle email s reset linkem
3. Link obsahuje token pro autentizaci
4. Po kliknutí uživatel nastaví nové heslo

---

## 📧 Nastavení Email šablon (DŮLEŽITÉ!):

Pro správnou funkčnost musíte nakonfigurovat email šablony v Supabase:

### **KROK 1: Přejít na Email Templates**
https://supabase.com/dashboard/project/xhjkjcrjfwhrzjackboa/auth/templates

### **KROK 2: Upravit "Reset Password" šablonu**

Klikněte na **"Reset Password"** a upravte:

**Předmět (Subject):**
```
Obnovení hesla - Reality v Kapse
```

**Email tělo (Body) - česká verze:**
```html
<h2>Obnovení hesla</h2>

<p>Ahoj!</p>

<p>Někdo požádal o obnovení hesla pro váš účet v aplikaci Reality v Kapse.</p>

<p>Pokud jste to byli vy, klikněte na tlačítko níže pro vytvoření nového hesla:</p>

<p><a href="{{ .ConfirmationURL }}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Obnovit heslo</a></p>

<p>Nebo zkopírujte tento odkaz do prohlížeče:</p>
<p>{{ .ConfirmationURL }}</p>

<p><strong>Tento odkaz je platný 1 hodinu.</strong></p>

<p>Pokud jste o reset hesla nežádali, můžete tento email ignorovat.</p>

<p>S pozdravem,<br>
Tým Reality v Kapse</p>
```

### **KROK 3: Nastavit Redirect URL**

V sekci **"URL Configuration"**:
- **Site URL:** `reality-v-kapse://`
- **Redirect URLs:** Přidejte:
  ```
  reality-v-kapse://reset-password
  https://xhjkjcrjfwhrzjackboa.supabase.co/auth/v1/verify
  ```

---

## 🎨 Jak vypadá ForgotPasswordScreen:

```
┌─────────────────────────────┐
│  ← Zpět                     │
│                             │
│         🔒                  │
│   Zapomenuté heslo          │
│                             │
│ Zadejte svůj email a my     │
│ vám pošleme odkaz pro       │
│ obnovení hesla              │
│                             │
│  Email:                     │
│  [_________________]        │
│                             │
│  [ Odeslat odkaz ]          │
│                             │
│  ℹ️ Odkaz pro reset hesla   │
│     bude platný 1 hodinu.   │
│     Zkontrolujte spam.      │
└─────────────────────────────┘
```

---

## 🔍 Error handling:

ForgotPasswordScreen ošetřuje tyto případy:

1. **Prázdný email** → "Vyplňte prosím email"
2. **Neplatný formát** → "Zadejte platný email"
3. **Email neexistuje** → "Tento email není registrován"
4. **Rate limit** → "Příliš mnoho pokusů"
5. **Úspěch** → "Email odeslán!"

---

## 🧪 Jak otestovat:

### **Test 1: Validace**
1. Zkuste odeslat prázdný email → měla by být chyba
2. Zkuste neplatný email (např. "test") → měla by být chyba

### **Test 2: Funkční reset**
1. Zadejte existující email (např. ten, kterým jste se registrovali)
2. Klikněte "Odeslat odkaz"
3. Zkontrolujte emailovou schránku
4. Klikněte na odkaz v emailu
5. Nastavte nové heslo
6. Vraťte se do aplikace a přihlaste se novým heslem

### **Test 3: Neexistující email**
1. Zadejte email, který není registrován
2. Měli byste dostat chybu "Email není registrován"

---

## 📱 UI/UX Features:

- ✅ **Zpětné tlačítko** pro návrat na login
- ✅ **Auto-focus** na email input
- ✅ **Loading state** s animací
- ✅ **Success state** - zelená ikona po odeslání
- ✅ **Info box** s užitečnými informacemi
- ✅ **Validace emailu** s user-friendly chybami
- ✅ **Disabled state** po úspěšném odeslání (prevence spamu)

---

## 🎯 Co dělat TEĎ:

1. ✅ **Kód je přidán** - screen i navigace fungují
2. ⚠️ **Nastavte email šablony v Supabase** (odkaz výše)
3. ✅ **Otestujte funkčnost** v aplikaci

---

## 💡 Budoucí vylepšení (volitelné):

- [ ] In-app reset hesla (bez emailu)
- [ ] Countdown timer pro opětovné odeslání emailu
- [ ] Hlubší integrace s mobilním deep linkem
- [ ] Biometrické přihlášení (Face ID / Touch ID)

---

## 🆘 Troubleshooting:

### **Email nedorazil:**
- Zkontrolujte spam složku
- Ověřte, že email šablony jsou správně nastaveny v Supabase
- Zkontrolujte, že SMTP je nakonfigurováno v Supabase

### **Link nefunguje:**
- Ověřte Redirect URLs v Supabase
- Link je platný jen 1 hodinu
- Zkuste zadat email znovu

### **Chyba "Email not found":**
- Email není registrován
- Zkuste se nejdřív zaregistrovat

---

**Hotovo!** 🎉 Funkce zapomenutého hesla je plně implementována a připravena k použití.

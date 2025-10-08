# 🔑 Jak získat Supabase Service Key

## Potřebujete Service Key pro migration script

Migration script potřebuje **service_role key** (ne anon key), protože musí zapisovat do databáze.

---

## 📋 KROK ZA KROKEM:

### **1. Otevřete Supabase Settings:**
https://supabase.com/dashboard/project/xhjkjcrjfwhrzjackboa/settings/api

### **2. Najděte "service_role" klíč:**
- Scroll dolů na sekci **"Project API keys"**
- Najděte řádek **"service_role"**
- Klikněte na **"Reveal"** (ikona oka)
- **Zkopírujte klíč**

⚠️ **POZOR:** Service key je TAJNÝ! Nikdy ho nesdílejte ani necommitujte do GIT!

### **3. Přidejte do .env:**
Otevřete soubor `.env` a přidejte:

```env
# Supabase Service Key (pro migration scripts a scraper)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey... (váš klíč)
```

---

## ✅ Hotovo!

Nyní můžete spustit migration script:
```bash
node migrate-to-supabase.js
```

---

## 🔐 Bezpečnost:

- ✅ Service key používejte JEN na serveru/v scriptech
- ❌ NIKDY ho nedávejte do mobilní aplikace
- ❌ NIKDY ho necommitujte do GIT
- ✅ V aplikaci používejte jen `anon_key`

---

## 💡 Pro migration můžete použít i anon_key:

Pokud nechcete řešit service_role key, migration script zkusí použít `EXPO_PUBLIC_SUPABASE_ANON_KEY` jako fallback. 

Ale budete muset dočasně upravit RLS policies v Supabase:
```sql
-- Dočasně povolit zápis s anon key
DROP POLICY IF EXISTS "Service role can manage properties" ON properties;
CREATE POLICY "Anon can insert for migration" ON properties
  FOR ALL USING (true);
```

Po migraci vraťte původní policy.

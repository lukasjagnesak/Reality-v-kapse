-- Reality v Kapse - Database Schema
-- Spusťte tento SQL v Supabase SQL Editor

-- ============================================================================
-- 1. TABULKA: user_profiles
-- Uchovává profily uživatelů (rozšíření auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  subscription_type TEXT NOT NULL DEFAULT 'free' CHECK (subscription_type IN ('free', 'basic', 'premium', 'pro')),
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Povolit RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políčka pro RLS
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger pro automatické vytvoření profilu po registraci
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger na nové uživatele
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger pro updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 2. TABULKA: user_preferences
-- Uchovává uživatelské preference pro filtrování nemovitostí
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  locations JSONB NOT NULL DEFAULT '[]'::jsonb,
  property_types JSONB NOT NULL DEFAULT '["byt", "dům"]'::jsonb,
  dispositions JSONB NOT NULL DEFAULT '["1+kk", "1+1", "2+kk", "2+1", "3+kk", "3+1", "4+kk", "4+1"]'::jsonb,
  price_min INTEGER NOT NULL DEFAULT 0,
  price_max INTEGER NOT NULL DEFAULT 50000000,
  area_min INTEGER NOT NULL DEFAULT 0,
  area_max INTEGER NOT NULL DEFAULT 500,
  min_discount_percentage INTEGER NOT NULL DEFAULT 0,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Povolit RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Políčka pro RLS
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON public.user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger pro updated_at
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger pro automatické vytvoření defaultních preferencí
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_profile_created ON public.user_profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_preferences();

-- ============================================================================
-- 3. TABULKA: user_favorites
-- Uchovává oblíbené nemovitosti uživatelů
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Povolit RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Políčka pro RLS
CREATE POLICY "Users can view own favorites" ON public.user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Index pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS user_favorites_user_id_idx ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS user_favorites_property_id_idx ON public.user_favorites(property_id);

-- ============================================================================
-- 4. GRANT PERMISSIONS
-- ============================================================================

-- Umožnit authenticated users přístup k tabulkám
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_favorites TO authenticated;

-- ============================================================================
-- ✅ HOTOVO!
-- Nyní máte kompletní databázi pro Reality v Kapse
-- ============================================================================

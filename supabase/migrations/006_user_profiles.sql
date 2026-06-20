-- User profiles (extends auth.users)
-- Guest / email / Google — provider stored on profile

CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email         text,
  display_name  text,
  avatar_url    text,
  is_guest      boolean NOT NULL DEFAULT false,
  auth_provider text NOT NULL DEFAULT 'email'
    CHECK (auth_provider IN ('email', 'google', 'guest')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_is_guest ON public.profiles (is_guest);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON public.profiles (auth_provider);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  provider text;
  guest_flag boolean;
BEGIN
  guest_flag := COALESCE((NEW.raw_user_meta_data->>'is_guest')::boolean, false);
  provider := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'auth_provider', ''),
    CASE
      WHEN guest_flag OR NEW.email LIKE 'guest\_%@%' ESCAPE '\' THEN 'guest'
      WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN 'google'
      ELSE 'email'
    END
  );

  INSERT INTO public.profiles (id, email, display_name, avatar_url, is_guest, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, 'user'), '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    guest_flag OR provider = 'guest',
    provider
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

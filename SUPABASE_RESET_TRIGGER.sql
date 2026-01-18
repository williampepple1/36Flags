-- THIS SCRIPT RESETS AND ROBUSTIFIES THE AUTOMATIC USER CREATION LOGIC
-- Run this in the Supabase SQL Editor

-- 1. DETACH AND DROP EXISTING TRIGGERS/FUNCTIONS (Clean Slate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. CREATE A MORE ROBUST HANDLING FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_username text;
BEGIN
  -- Attempt to get username from metadata
  extracted_username := NEW.raw_user_meta_data->>'username';

  -- Fallback: Use email prefix if username is missing
  IF extracted_username IS NULL OR extracted_username = '' THEN
    extracted_username := split_part(NEW.email, '@', 1);
  END IF;

  -- Insert the new user profile
  -- We use ON CONFLICT DO NOTHING to prevent crashing if the user already somehow exists
  INSERT INTO public.users (auth_id, email, username, is_online)
  VALUES (
    NEW.id,
    NEW.email,
    extracted_username,
    true
  )
  ON CONFLICT (auth_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error (visible in Postgres logs) but don't block auth user creation
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RE-ATTACH THE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. DIAGNOSTIC: Check if any "Unknown" users exist (Auth users without Public profiles)
-- This query returns Auth IDs that are missing from the public users table
SELECT id, email, created_at FROM auth.users 
WHERE id NOT IN (SELECT auth_id FROM public.users);

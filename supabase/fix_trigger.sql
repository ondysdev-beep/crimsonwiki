-- ============================================================
-- CrimsonWiki — COMPLETE FIX for Discord login
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- STEP 1: Delete any orphaned auth.users entries that have no matching profile
-- (from previous failed login attempts)
delete from auth.users
where id not in (select id from public.profiles)
  and id in (
    select id from auth.users
    where raw_user_meta_data->>'iss' = 'https://discord.com/api'
  );

-- STEP 2: Drop and recreate the trigger function with all fixes
create or replace function public.handle_new_user()
returns trigger as $$
declare
  _username text;
begin
  -- Build username with safe fallbacks
  -- IMPORTANT: use -> (returns json) then ->> (returns text) when chaining
  _username := coalesce(
    new.raw_user_meta_data->'custom_claims'->>'global_name',
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1),
    'user_' || substr(new.id::text, 1, 8)
  );

  -- Trim and sanitize
  _username := trim(_username);
  if _username = '' or _username is null then
    _username := 'user_' || substr(new.id::text, 1, 8);
  end if;

  -- Ensure username uniqueness (profiles.username has UNIQUE constraint)
  if exists (select 1 from public.profiles where username = _username) then
    _username := _username || '_' || substr(md5(random()::text), 1, 4);
  end if;

  -- Insert the profile
  insert into public.profiles (id, username, avatar_url, discord_id)
  values (
    new.id,
    _username,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'provider_id'
  );

  return new;
exception when others then
  -- Log the error but do NOT block user creation in auth.users
  raise warning 'handle_new_user failed for user %: %', new.id, sqlerrm;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- STEP 3: Ensure the trigger exists (recreate if needed)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- DONE! Now try logging in with Discord again.
-- ============================================================

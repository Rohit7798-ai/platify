-- Supabase Schema for Plantify_3

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Plants Table (Collection)
CREATE TABLE public.plants (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  scientific_name text,
  image text,
  tags text[],
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- Plants RLS
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own plants." ON public.plants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own plants." ON public.plants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plants." ON public.plants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plants." ON public.plants FOR DELETE USING (auth.uid() = user_id);

-- 3. Scans Table (History)
CREATE TABLE public.scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text,
  scientific_name text,
  image_url text,
  type text,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Scans RLS
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own scans." ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scans." ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scans." ON public.scans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scans." ON public.scans FOR DELETE USING (auth.uid() = user_id);

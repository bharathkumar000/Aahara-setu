# 🛠️ Aahara Setu: Supabase Implementation Guide

This guide ensures that user roles are persistent and synchronized between **Supabase Auth** and the **Public Database**.

## 1. Core Profile Management
To ensure a user is always recognized as a **Donor** or **Receiver** after logging in, we use a `profiles` table that stores the role.

### Database Schema (SQL)
Run this in your Supabase SQL Editor:

```sql
-- 1. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('donor', 'receiver', 'admin')) NOT NULL DEFAULT 'donor',
  organization_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Real-time
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- 3. Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);
```

### 2. Automated Role Sync (The Magic 🪄)
This trigger automatically creates a row in `public.profiles` every time a new user signs up via Supabase Auth. It extracts the `role` from the `user_metadata` passed during signup.

```sql
-- 4. Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, organization_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    COALESCE(NEW.raw_user_meta_data->>'role', 'donor'),
    NEW.raw_user_meta_data->>'organization_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger the function on every signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 3. Frontend Integration (AuthContext.tsx)
When the user logs in, the app should fetch their profile to determine their role.

### Signup Logic
When calling `supabase.auth.signUp`, include the role in the metadata:
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword',
  options: {
    data: {
      role: 'receiver', // This is what the SQL trigger catches!
      full_name: 'Hope Foundation'
    }
  }
});
```

### Persistent Redirection
In `App.tsx`, we already have logic to redirect based on the `role` stored in `AuthContext`. By fetching the role from the `profiles` table upon login, the user will always be sent to their respective dashboard:

- **Donor** -> `/` (Landing/Upload)
- **Receiver** -> `/receiver`
- **Admin** -> `/admin`

---

## 4. Food Listings Table (Demo Ready)
```sql
CREATE TABLE food_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  donor TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity TEXT NOT NULL,
  expires_in TEXT NOT NULL,
  distance TEXT DEFAULT '0.4 km',
  demand TEXT DEFAULT 'High',
  address TEXT NOT NULL,
  phone TEXT DEFAULT '+91 98765 43210'
);

-- Enable public access for demo
ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON food_listings FOR ALL USING (true);
```

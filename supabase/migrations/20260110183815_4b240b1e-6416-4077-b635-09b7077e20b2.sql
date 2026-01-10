-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table to store member info
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create members table (for non-authenticated members managed by admin)
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on members
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Create daily_meals table for meal entries
CREATE TABLE public.daily_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    lunch BOOLEAN NOT NULL DEFAULT false,
    dinner BOOLEAN NOT NULL DEFAULT false,
    lunch_count INTEGER NOT NULL DEFAULT 0,
    dinner_count INTEGER NOT NULL DEFAULT 0,
    submitted_by UUID REFERENCES auth.users(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (date, member_id)
);

-- Enable RLS on daily_meals
ALTER TABLE public.daily_meals ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if current time is before 10 PM Bangladesh time
CREATE OR REPLACE FUNCTION public.is_before_deadline()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT (CURRENT_TIME AT TIME ZONE 'Asia/Dhaka') < '22:00:00'::TIME
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for members
CREATE POLICY "Admins can manage all members"
ON public.members
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can view their own record"
ON public.members
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone authenticated can view active members"
ON public.members
FOR SELECT
TO authenticated
USING (is_active = true);

-- RLS Policies for daily_meals
CREATE POLICY "Admins can manage all meals"
ON public.daily_meals
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can view their own meals"
ON public.daily_meals
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.members m 
        WHERE m.id = daily_meals.member_id 
        AND m.user_id = auth.uid()
    )
);

CREATE POLICY "Members can insert their own meals before 10 PM"
ON public.daily_meals
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.members m 
        WHERE m.id = member_id 
        AND m.user_id = auth.uid()
    )
    AND date = CURRENT_DATE
    AND public.is_before_deadline()
);

CREATE POLICY "Members can update their own meals before 10 PM"
ON public.daily_meals
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.members m 
        WHERE m.id = daily_meals.member_id 
        AND m.user_id = auth.uid()
    )
    AND date = CURRENT_DATE
    AND public.is_before_deadline()
);

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON public.members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_meals_updated_at
    BEFORE UPDATE ON public.daily_meals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
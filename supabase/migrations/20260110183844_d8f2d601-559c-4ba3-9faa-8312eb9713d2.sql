-- Fix security warning: Set search_path for is_before_deadline function
CREATE OR REPLACE FUNCTION public.is_before_deadline()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT (CURRENT_TIME AT TIME ZONE 'Asia/Dhaka') < '22:00:00'::TIME
$$;
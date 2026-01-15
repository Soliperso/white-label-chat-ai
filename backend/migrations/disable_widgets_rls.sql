-- Since backend uses service role key which bypasses RLS,
-- we can disable RLS for simpler development
-- (Re-enable in production with proper policies)

ALTER TABLE public.widgets DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view widgets in their organization" ON public.widgets;
DROP POLICY IF EXISTS "Users can create widgets in their organization" ON public.widgets;
DROP POLICY IF EXISTS "Users can update widgets in their organization" ON public.widgets;
DROP POLICY IF EXISTS "Users can delete widgets in their organization" ON public.widgets;
DROP POLICY IF EXISTS "Service role has full access to widgets" ON public.widgets;
DROP POLICY IF EXISTS "Users can manage widgets in their organization" ON public.widgets;

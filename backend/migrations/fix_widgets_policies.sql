-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view widgets in their organization" ON public.widgets;
DROP POLICY IF EXISTS "Users can create widgets in their organization" ON public.widgets;
DROP POLICY IF EXISTS "Users can update widgets in their organization" ON public.widgets;
DROP POLICY IF EXISTS "Users can delete widgets in their organization" ON public.widgets;

-- Service role can bypass RLS, so create a policy that allows service role to do everything
CREATE POLICY "Service role has full access to widgets"
  ON public.widgets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For authenticated users, allow access based on organizationId
CREATE POLICY "Users can manage widgets in their organization"
  ON public.widgets
  FOR ALL
  TO authenticated
  USING (
    "organizationId" IN (
      SELECT "organizationId"
      FROM public.users
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId"
      FROM public.users
      WHERE id = auth.uid()
    )
  );

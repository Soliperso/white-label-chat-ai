-- Create widgets table in Supabase
CREATE TABLE IF NOT EXISTS public.widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organizationId" UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'inactive')),
  "primaryColor" VARCHAR(7) DEFAULT '#4F46E5',
  "accentColor" VARCHAR(7) DEFAULT '#9333EA',
  "logoUrl" VARCHAR(255),
  "fontFamily" VARCHAR(100) DEFAULT 'Arial, sans-serif',
  "whiteLabel" BOOLEAN DEFAULT false,
  "welcomeMessage" VARCHAR(255) DEFAULT 'Hi! How can I help you today?',
  "fallbackMessage" VARCHAR(255) DEFAULT 'I''m sorry, I don''t know how to answer that.',
  "confidenceThreshold" FLOAT DEFAULT 0.7,
  "collectEmail" BOOLEAN DEFAULT true,
  "showTypingIndicator" BOOLEAN DEFAULT true,
  position VARCHAR(20) DEFAULT 'bottom-right' CHECK (position IN ('bottom-right', 'bottom-left', 'top-right', 'top-left')),
  "buttonSize" INTEGER DEFAULT 60,
  "chatWindowWidth" INTEGER DEFAULT 400,
  "chatWindowHeight" INTEGER DEFAULT 600,
  "totalConversations" INTEGER DEFAULT 0,
  "totalMessages" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see widgets in their organization
CREATE POLICY "Users can view widgets in their organization"
  ON public.widgets FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM public.users WHERE "organizationId" = widgets."organizationId"
  ));

-- RLS Policy: Users can insert widgets in their organization
CREATE POLICY "Users can create widgets in their organization"
  ON public.widgets FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM public.users WHERE "organizationId" = widgets."organizationId"
  ));

-- RLS Policy: Users can update widgets in their organization
CREATE POLICY "Users can update widgets in their organization"
  ON public.widgets FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM public.users WHERE "organizationId" = widgets."organizationId"
  ));

-- RLS Policy: Users can delete widgets in their organization
CREATE POLICY "Users can delete widgets in their organization"
  ON public.widgets FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM public.users WHERE "organizationId" = widgets."organizationId"
  ));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_widgets_organization_id ON public.widgets("organizationId");
CREATE INDEX IF NOT EXISTS idx_widgets_status ON public.widgets(status);

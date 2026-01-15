-- Create widgets table
CREATE TABLE IF NOT EXISTS widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organizationId" UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'inactive')),

  -- Branding configuration
  "primaryColor" VARCHAR(7) NOT NULL DEFAULT '#4F46E5',
  "accentColor" VARCHAR(7) NOT NULL DEFAULT '#9333EA',
  "logoUrl" VARCHAR(255),
  "fontFamily" VARCHAR(100) NOT NULL DEFAULT 'Arial, sans-serif',
  "whiteLabel" BOOLEAN NOT NULL DEFAULT FALSE,

  -- Behavior configuration
  "welcomeMessage" VARCHAR(255) NOT NULL DEFAULT 'Hi! How can I help you today?',
  "fallbackMessage" VARCHAR(255) NOT NULL DEFAULT 'I''m sorry, I don''t know how to answer that.',
  "confidenceThreshold" FLOAT NOT NULL DEFAULT 0.7,
  "collectEmail" BOOLEAN NOT NULL DEFAULT TRUE,
  "showTypingIndicator" BOOLEAN NOT NULL DEFAULT TRUE,

  -- Widget styling
  position VARCHAR(20) NOT NULL DEFAULT 'bottom-right' CHECK (position IN ('bottom-right', 'bottom-left', 'top-right', 'top-left')),
  "buttonSize" INTEGER NOT NULL DEFAULT 60,
  "chatWindowWidth" INTEGER NOT NULL DEFAULT 400,
  "chatWindowHeight" INTEGER NOT NULL DEFAULT 600,

  -- Analytics
  "totalConversations" INTEGER NOT NULL DEFAULT 0,
  "totalMessages" INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on organizationId for faster lookups
CREATE INDEX IF NOT EXISTS idx_widgets_organization_id ON widgets("organizationId");

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_widgets_status ON widgets(status);

-- Enable RLS (Row Level Security)
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see widgets from their organization
CREATE POLICY widgets_select_policy ON widgets
  FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM users WHERE id = auth.uid()
    )
  );

-- Users can only insert widgets for their organization
CREATE POLICY widgets_insert_policy ON widgets
  FOR INSERT
  WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM users WHERE id = auth.uid()
    )
  );

-- Users can only update widgets from their organization
CREATE POLICY widgets_update_policy ON widgets
  FOR UPDATE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM users WHERE id = auth.uid()
    )
  );

-- Users can only delete widgets from their organization
CREATE POLICY widgets_delete_policy ON widgets
  FOR DELETE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM users WHERE id = auth.uid()
    )
  );

-- Create trigger to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_widgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER widgets_updated_at_trigger
  BEFORE UPDATE ON widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_widgets_updated_at();

-- Create RPC functions for incrementing counters
CREATE OR REPLACE FUNCTION increment_widget_conversations(widget_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE widgets
  SET "totalConversations" = "totalConversations" + 1
  WHERE id = widget_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_widget_messages(widget_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE widgets
  SET "totalMessages" = "totalMessages" + 1
  WHERE id = widget_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

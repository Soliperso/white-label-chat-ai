-- Migration: Fix widgets table to match Widget entity
-- This migration aligns the database schema with the TypeORM entity definition

-- Drop existing widgets table (WARNING: this will delete all widget data)
DROP TABLE IF EXISTS widgets CASCADE;

-- Recreate widgets table with correct schema
CREATE TABLE widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organizationId" UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active' NOT NULL,

  -- Branding configuration
  "primaryColor" VARCHAR(7) DEFAULT '#4F46E5' NOT NULL,
  "accentColor" VARCHAR(7) DEFAULT '#9333EA' NOT NULL,
  "logoUrl" VARCHAR(255),
  "fontFamily" VARCHAR(100) DEFAULT 'Arial, sans-serif' NOT NULL,
  "whiteLabel" BOOLEAN DEFAULT false NOT NULL,

  -- Behavior configuration
  "welcomeMessage" VARCHAR(255) DEFAULT 'Hi! How can I help you today?' NOT NULL,
  "fallbackMessage" VARCHAR(255) DEFAULT 'I''m sorry, I don''t know how to answer that.' NOT NULL,
  "confidenceThreshold" REAL DEFAULT 0.7 NOT NULL,
  "collectEmail" BOOLEAN DEFAULT true NOT NULL,
  "showTypingIndicator" BOOLEAN DEFAULT true NOT NULL,

  -- Widget position and styling
  position VARCHAR(20) DEFAULT 'bottom-right' NOT NULL,
  "buttonSize" INTEGER DEFAULT 60 NOT NULL,
  "chatWindowWidth" INTEGER DEFAULT 400 NOT NULL,
  "chatWindowHeight" INTEGER DEFAULT 600 NOT NULL,

  -- Analytics
  "totalConversations" INTEGER DEFAULT 0 NOT NULL,
  "totalMessages" INTEGER DEFAULT 0 NOT NULL,

  "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,

  -- Foreign key constraint
  CONSTRAINT "FK_widgets_organizationId" FOREIGN KEY ("organizationId")
    REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create index on organizationId for faster queries
CREATE INDEX "IDX_widgets_organizationId" ON widgets("organizationId");

-- Create index on status for filtering
CREATE INDEX "IDX_widgets_status" ON widgets(status);

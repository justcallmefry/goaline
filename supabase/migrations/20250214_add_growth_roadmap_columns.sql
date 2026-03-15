-- Add columns to plans table for Growth Roadmap (Money Map + future views).
-- Run this in Supabase: SQL Editor → New query → paste → Run.

ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS plan_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS roadmap_data jsonb DEFAULT NULL;

COMMENT ON COLUMN plans.plan_type IS 'e.g. growth_roadmap | legacy';
COMMENT ON COLUMN plans.roadmap_data IS 'JSON: { inputs, view1, view2, ... } for growth roadmap plans';

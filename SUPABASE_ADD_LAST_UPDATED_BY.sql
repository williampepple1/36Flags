-- Add last_updated_by column to games table
-- This allows the frontend to filter out its own updates from the realtime subscription
-- to prevent optimistic UI overwrites.

ALTER TABLE games 
ADD COLUMN last_updated_by UUID REFERENCES users(id);

-- Update the RLS policy to allow updating this column
-- (The existing policy "Games can be updated by players" should cover it, 
-- but we need to make sure the column is accessible).

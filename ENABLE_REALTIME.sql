-- ENABLE REALTIME FOR ALL TABLES
-- It is likely that the initial schema setup failed before reaching these lines.
-- Run this in your Supabase SQL Editor.

-- Add tables to the publication
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table game_invitations;
alter publication supabase_realtime add table games;

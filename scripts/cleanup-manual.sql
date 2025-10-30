-- Manual Database Cleanup SQL
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor)
-- This script bypasses RLS (Row Level Security) policies

-- =============================================================================
-- Step 1: Disable RLS temporarily (optional, but recommended)
-- =============================================================================
ALTER TABLE image DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu DISABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Step 2: Delete all data from image table (must be first due to FK)
-- =============================================================================
DELETE FROM image;

-- =============================================================================
-- Step 3: Delete all data from menu table
-- =============================================================================
DELETE FROM menu;

-- =============================================================================
-- Step 4: Re-enable RLS (if you disabled it in Step 1)
-- =============================================================================
ALTER TABLE image ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Step 5: Verification - Check remaining records
-- =============================================================================
SELECT 'image' as table_name, COUNT(*) as remaining_records FROM image
UNION ALL
SELECT 'menu' as table_name, COUNT(*) as remaining_records FROM menu;

-- =============================================================================
-- Optional: Remove foreign key constraint
-- =============================================================================
-- Uncomment the following lines if you want to remove the FK constraint:
-- ALTER TABLE image DROP CONSTRAINT IF EXISTS fk_image_menu_id;
-- DROP INDEX IF EXISTS idx_image_menu_id;

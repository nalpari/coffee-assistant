-- Migration: Clean up menu/image data and remove foreign key constraint
-- Created: 2025-10-30
-- Description:
--   1. Delete all data from image table
--   2. Delete all data from menu table
--   3. Remove foreign key constraint from image.menu_id
--
-- IMPORTANT: This is a destructive operation. All menu and image data will be lost.
-- Make sure to backup data before running this migration if needed.

-- =============================================================================
-- Step 1: Delete all data from image table (must be first due to FK)
-- =============================================================================
DELETE FROM image;

-- =============================================================================
-- Step 2: Delete all data from menu table
-- =============================================================================
DELETE FROM menu;

-- =============================================================================
-- Step 3: Remove foreign key constraint from image table
-- =============================================================================
ALTER TABLE image
DROP CONSTRAINT IF EXISTS fk_image_menu_id;

-- =============================================================================
-- Step 4: Remove index (optional, but recommended for consistency)
-- =============================================================================
DROP INDEX IF EXISTS idx_image_menu_id;

-- =============================================================================
-- Verification queries (commented out, run manually if needed)
-- =============================================================================
-- Verify all data is deleted
-- SELECT COUNT(*) as remaining_images FROM image;
-- SELECT COUNT(*) as remaining_menus FROM menu;

-- Verify foreign key is removed
-- SELECT
--   tc.constraint_name,
--   tc.table_name,
--   kcu.column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_name = 'image'
--   AND kcu.column_name = 'menu_id';

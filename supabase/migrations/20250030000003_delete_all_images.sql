-- Migration: Delete all data from image table
-- Created: 2025-01-30
-- Purpose: Clean up image table before proper data re-insertion with correct menu_id mapping

-- Step 1: Backup image table (for safety)
CREATE TABLE IF NOT EXISTS image_backup_20250130 AS
SELECT * FROM public.image;

-- Step 2: Delete all records from image table
DELETE FROM public.image;

-- Step 3: Verify deletion
-- Expected result: 0 records
SELECT COUNT(*) as remaining_records FROM public.image;

-- Note: Backup table can be dropped later if not needed
-- DROP TABLE IF EXISTS image_backup_20250130;

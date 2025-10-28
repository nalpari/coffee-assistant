-- Migration: Add foreign key constraint to image table
-- Created: 2025-10-28
-- Description:
--   1. Backup orphaned image records (menu_id not in menu table)
--   2. Delete orphaned records
--   3. Add foreign key constraint with CASCADE delete
--   4. Create index for JOIN performance

-- =============================================================================
-- Step 1: Create backup table for orphaned records
-- =============================================================================
CREATE TABLE IF NOT EXISTS image_orphaned_backup (
  file_uuid varchar(255) NOT NULL,
  created_by varchar(255) NOT NULL,
  created_date timestamp(6),
  file_name varchar(255) NOT NULL,
  menu_id int8 NOT NULL,
  menu_type varchar(255) NOT NULL,
  ordering int4 NOT NULL,
  backup_date timestamp DEFAULT NOW(),
  PRIMARY KEY (file_uuid)
);

-- =============================================================================
-- Step 2: Backup orphaned records before deletion
-- =============================================================================
INSERT INTO image_orphaned_backup
  (file_uuid, created_by, created_date, file_name, menu_id, menu_type, ordering)
SELECT
  i.file_uuid, i.created_by, i.created_date, i.file_name, i.menu_id, i.menu_type, i.ordering
FROM image i
LEFT JOIN menu m ON i.menu_id = m.id
WHERE m.id IS NULL
ON CONFLICT (file_uuid) DO NOTHING;

-- =============================================================================
-- Step 3: Delete orphaned records
-- =============================================================================
DELETE FROM image
WHERE menu_id NOT IN (SELECT id FROM menu);

-- =============================================================================
-- Step 4: Add foreign key constraint
-- =============================================================================
ALTER TABLE image
ADD CONSTRAINT fk_image_menu_id
FOREIGN KEY (menu_id)
REFERENCES menu(id)
ON DELETE CASCADE;

-- =============================================================================
-- Step 5: Create index for JOIN performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_image_menu_id ON image(menu_id);

-- =============================================================================
-- Verification queries (commented out, run manually if needed)
-- =============================================================================
-- Check foreign key constraint
-- SELECT
--   tc.constraint_name,
--   tc.table_name,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_name = 'image';

-- Check data integrity
-- SELECT
--   (SELECT COUNT(*) FROM image) as total_images,
--   (SELECT COUNT(*) FROM image i LEFT JOIN menu m ON i.menu_id = m.id WHERE m.id IS NULL) as orphaned_images,
--   (SELECT COUNT(*) FROM image i INNER JOIN menu m ON i.menu_id = m.id) as valid_images;

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'image';

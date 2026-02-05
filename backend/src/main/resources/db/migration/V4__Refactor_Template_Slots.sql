-- =====================================================
-- V4: Refactor Template to CNPJ + Slot System
-- Allows 3 templates per CNPJ
-- =====================================================

-- Add new columns
ALTER TABLE badge_template ADD COLUMN cnpj VARCHAR(18);
ALTER TABLE badge_template ADD COLUMN slot_number INTEGER DEFAULT 1;
ALTER TABLE badge_template ADD COLUMN template_name VARCHAR(255);

-- Migrate existing data (use nome_empresa as placeholder for migration)
UPDATE badge_template SET cnpj = nome_empresa WHERE cnpj IS NULL;
UPDATE badge_template SET slot_number = 1 WHERE slot_number IS NULL;
UPDATE badge_template SET template_name = nome_empresa WHERE template_name IS NULL;

-- Set NOT NULL constraints after data migration
ALTER TABLE badge_template ALTER COLUMN cnpj SET NOT NULL;
ALTER TABLE badge_template ALTER COLUMN slot_number SET NOT NULL;

-- Add check constraint to limit slots to 1, 2, or 3
ALTER TABLE badge_template ADD CONSTRAINT check_slot_range CHECK (slot_number >= 1 AND slot_number <= 3);

-- Add composite unique constraint (CNPJ + slot must be unique)
ALTER TABLE badge_template ADD CONSTRAINT unique_cnpj_slot UNIQUE (cnpj, slot_number);

-- Drop old unique constraint on nome_empresa
ALTER TABLE badge_template DROP CONSTRAINT IF EXISTS badge_template_nome_empresa_key;

-- Drop old column
ALTER TABLE badge_template DROP COLUMN nome_empresa;

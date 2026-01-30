-- Add Better Auth admin plugin columns to users table
-- Required for banUser/unbanUser functionality

ALTER TABLE users
ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS banReason TEXT NULL,
ADD COLUMN IF NOT EXISTS banExpires DATETIME NULL;

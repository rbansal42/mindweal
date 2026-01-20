-- Migration: AddSpecializationAndTherapistUpdates
-- Created: 2026-01-20
-- Description: Creates specialization table and adds columns to therapist table

-- Create specialization table
CREATE TABLE IF NOT EXISTS `specialization` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN DEFAULT TRUE,
    `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add specializationIds column to therapist table (JSON array of specialization IDs)
-- Note: Run this only if the column doesn't already exist
ALTER TABLE `therapist`
ADD COLUMN `specializationIds` JSON NULL;

-- Add deletedAt column to therapist table for soft delete functionality
ALTER TABLE `therapist`
ADD COLUMN `deletedAt` TIMESTAMP NULL;

-- Create index on specialization name for faster lookups
CREATE INDEX `idx_specialization_name` ON `specialization` (`name`);

-- Create index on therapist deletedAt for filtering active/archived therapists
CREATE INDEX `idx_therapist_deleted_at` ON `therapist` (`deletedAt`);

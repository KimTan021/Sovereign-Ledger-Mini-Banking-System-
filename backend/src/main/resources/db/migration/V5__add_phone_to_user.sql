-- =============================================================
-- V5: Add phone column to user table
-- =============================================================

ALTER TABLE `user`
ADD COLUMN `phone` VARCHAR(20) NULL AFTER `role`;

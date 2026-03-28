-- =============================================================
-- V4: Update admin password, add phone & initial_deposit to pending_user
-- =============================================================

-- Update admin password to BCrypt hash of 'admin123'
UPDATE `user`
SET `password` = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE `user_email` = 'alice.santos@email.com';

-- Add phone column to pending_user
ALTER TABLE `pending_user`
ADD COLUMN `phone` VARCHAR(20) NULL AFTER `request_account_type`;

-- Add initial_deposit column to pending_user
ALTER TABLE `pending_user`
ADD COLUMN `initial_deposit` DECIMAL(17,2) NULL AFTER `phone`;

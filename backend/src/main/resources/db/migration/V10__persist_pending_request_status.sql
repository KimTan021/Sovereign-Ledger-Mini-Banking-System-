ALTER TABLE `pending_user`
DROP INDEX `user_email_UNIQUE`;

ALTER TABLE `pending_user`
ADD COLUMN `request_status` VARCHAR(20) NOT NULL DEFAULT 'Pending' AFTER `request_account_type`,
ADD COLUMN `reviewed_at` DATETIME(1) NULL AFTER `request_status`;

ALTER TABLE `pending_user`
ADD INDEX `pending_user_email_idx` (`user_email` ASC) VISIBLE,
ADD INDEX `pending_user_status_idx` (`request_status` ASC) VISIBLE;

UPDATE `pending_user`
SET `request_status` = 'Pending'
WHERE `request_status` IS NULL OR TRIM(`request_status`) = '';

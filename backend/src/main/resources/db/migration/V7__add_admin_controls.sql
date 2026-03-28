ALTER TABLE `user`
ADD COLUMN `user_status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' AFTER `phone`;

ALTER TABLE `transaction`
ADD COLUMN `review_note` VARCHAR(500) NULL AFTER `target_account_name`;

UPDATE `user`
SET `user_status` = 'ACTIVE'
WHERE `user_status` IS NULL;

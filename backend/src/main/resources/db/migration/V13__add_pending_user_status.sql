ALTER TABLE `pending_user`
ADD COLUMN `account_status` VARCHAR(20) NOT NULL DEFAULT 'Unconfirmed' AFTER `user_id`;

ALTER TABLE `pending_user`
CHANGE COLUMN `account_status` `email_status` VARCHAR(20) NOT NULL DEFAULT 'Unconfirmed' ;

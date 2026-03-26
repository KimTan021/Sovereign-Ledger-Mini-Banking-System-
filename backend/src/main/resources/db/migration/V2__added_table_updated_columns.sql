ALTER TABLE `transaction`
ADD COLUMN `transaction_description` VARCHAR(500) NOT NULL AFTER `transaction_time`,
ADD COLUMN `transaction_status` VARCHAR(20) NOT NULL AFTER `transaction_description`;

ALTER TABLE `user`
ADD UNIQUE INDEX `user_email_UNIQUE` (`user_email` ASC) VISIBLE;

ALTER TABLE `account`
ADD COLUMN `account_status` VARCHAR(20) NOT NULL AFTER `account_balance`;


CREATE TABLE IF NOT EXISTS `pending_user` (
  `pending_user_id` INT NOT NULL,
  `first_name` VARCHAR(45) NOT NULL,
  `middle_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `user_email` VARCHAR(512) NOT NULL,
  `password` VARCHAR(60) NOT NULL,
  `request_time` DATETIME(1) NOT NULL,
  `request_account_type` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`pending_user_id`),
  UNIQUE INDEX `user_email_UNIQUE` (`user_email` ASC) VISIBLE) ENGINE = InnoDB;

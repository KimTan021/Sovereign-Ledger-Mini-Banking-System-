CREATE TABLE `otp_verification` (
  `otp_id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(512) NOT NULL,
  `otp_code` VARCHAR(6) NOT NULL,
  `otp_purpose` VARCHAR(100) NOT NULL,
  `pending_user_id` INT NULL,
  `transaction_id` INT NULL,
  `created_at` DATETIME(1) NOT NULL,
  `expires_at` DATETIME(1) NOT NULL,
  `verified` TINYINT NOT NULL,
  `attempts` INT NOT NULL,
  PRIMARY KEY (`otp_id`),
  INDEX `fk_otp_pending_user_idx` (`pending_user_id` ASC) VISIBLE,
  INDEX `fk_otp_transaction_idx` (`transaction_id` ASC) VISIBLE,
  INDEX `idx_otp_email_purpose` (`email` ASC, `otp_purpose` ASC) INVISIBLE,
  INDEX `idx_otp_expires` (`expires_at` ASC) VISIBLE,
  CONSTRAINT `fk_otp_pending_user`
    FOREIGN KEY (`pending_user_id`)
    REFERENCES `pending_user` (`pending_user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_otp_transaction`
    FOREIGN KEY (`transaction_id`)
    REFERENCES `transaction` (`transaction_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE `otp_verification`
CHANGE COLUMN `verified` `verified` BIT(1) NOT NULL ;

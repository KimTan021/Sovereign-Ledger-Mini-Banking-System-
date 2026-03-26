CREATE TABLE IF NOT EXISTS `user` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(45) NOT NULL,
  `middle_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `user_email` VARCHAR(512) NOT NULL,
  `password` VARCHAR(60) NOT NULL,
  `role` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `account` (
  `account_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `account_number` VARCHAR(512) NOT NULL,
  `account_type` VARCHAR(10) NOT NULL,
  `account_balance` DECIMAL(17,2) NOT NULL,
  PRIMARY KEY (`account_id`),
  INDEX `accuid_idx` (`user_id` ASC),
  CONSTRAINT `accuid`
    FOREIGN KEY (`user_id`)
    REFERENCES `user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `transaction` (
  `transaction_id` INT NOT NULL AUTO_INCREMENT,
  `account_id` INT NOT NULL,
  `transaction_type` VARCHAR(6) NOT NULL,
  `transaction_amount` DECIMAL(17,2) NULL,
  `account_id_destination` INT NULL,
  `logs` VARCHAR(500) NOT NULL,
  `transaction_time` DATETIME(1) NOT NULL,
  PRIMARY KEY (`transaction_id`),
  INDEX `taccid_idx` (`account_id` ASC),
  CONSTRAINT `taccid`
    FOREIGN KEY (`account_id`)
    REFERENCES `account` (`account_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

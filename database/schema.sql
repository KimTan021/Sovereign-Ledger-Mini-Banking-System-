-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema bankdb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema bankdb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `bankdb` DEFAULT CHARACTER SET utf8 ;
USE `bankdb` ;

-- -----------------------------------------------------
-- Table `bankdb`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bankdb`.`user` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(45) NOT NULL,
  `middle_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  `user_email` VARCHAR(512) NOT NULL,
  `password` VARCHAR(60) NOT NULL,
  `role` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`user_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bankdb`.`account`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bankdb`.`account` (
  `account_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `account_number` VARCHAR(512) NOT NULL,
  `account_type` VARCHAR(10) NOT NULL,
  `account_balance` DECIMAL(17,2) NOT NULL,
  PRIMARY KEY (`account_id`),
  INDEX `accuid_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `accuid`
    FOREIGN KEY (`user_id`)
    REFERENCES `bankdb`.`user` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bankdb`.`transaction`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bankdb`.`transaction` (
  `transaction_id` INT NOT NULL AUTO_INCREMENT,
  `account_id` INT NOT NULL,
  `transaction_type` VARCHAR(6) NOT NULL,
  `transaction_amount` DECIMAL(17,2) NULL,
  `account_id_destination` INT NULL,
  `logs` VARCHAR(500) NOT NULL,
  `transaction_time` DATETIME(1) NOT NULL,
  PRIMARY KEY (`transaction_id`),
  INDEX `taccid_idx` (`account_id` ASC) VISIBLE,
  CONSTRAINT `taccid`
    FOREIGN KEY (`account_id`)
    REFERENCES `bankdb`.`account` (`account_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
-- Expand Transaction Type ENUM
-- Initial: ENUM('credit', 'debit')
-- New: ENUM('credit', 'debit', 'deposit', 'withdraw', 'transfer', 'internal')

ALTER TABLE `transaction` 
MODIFY COLUMN `transaction_type` ENUM('credit', 'debit', 'deposit', 'withdraw', 'transfer', 'internal') NOT NULL;

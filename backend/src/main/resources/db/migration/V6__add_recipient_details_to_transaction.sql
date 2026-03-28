-- V6__add_recipient_details_to_transaction.sql
ALTER TABLE transaction
ADD COLUMN target_account_number VARCHAR(255),
ADD COLUMN target_account_name VARCHAR(255);

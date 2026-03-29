CREATE TABLE notification (
    notification_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_id INT NULL,
    transaction_id INT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BIT NOT NULL DEFAULT b'0',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES user(user_id),
    CONSTRAINT fk_notification_account FOREIGN KEY (account_id) REFERENCES account(account_id),
    CONSTRAINT fk_notification_transaction FOREIGN KEY (transaction_id) REFERENCES transaction(transaction_id)
);

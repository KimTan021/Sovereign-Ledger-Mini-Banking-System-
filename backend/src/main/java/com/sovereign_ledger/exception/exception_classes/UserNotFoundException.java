package com.sovereign_ledger.exception.exception_classes;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}

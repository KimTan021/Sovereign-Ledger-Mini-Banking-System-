package com.sovereign_ledger.service;

public interface EmailService {
    void sendOtpEmail(String recipientEmail, String otpCode, String purpose);
    void sendAccountEmail(String recipientEmail, String firstName, String accountType, String accountNumber, String status);
}

package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.response.OTPResponseDTO;
import com.sovereign_ledger.entity.OTPVerification;
import com.sovereign_ledger.entity.PendingUser;
import com.sovereign_ledger.entity.Transaction;

import java.util.List;

public interface OTPVerificationService {
    public List<OTPVerification> findAllOTPs();
    public OTPVerification findOTPById(Integer id);
    public OTPVerification saveOTP(OTPVerification otp);
    public void deleteOTP(Integer id);

    OTPResponseDTO generateAndSendOtp(String email, String purpose, PendingUser pendingUser, Transaction transaction);
    OTPResponseDTO verifyOtp(String email, String otpCode, String purpose);
    OTPResponseDTO resendOtp(String email, String purpose);
}

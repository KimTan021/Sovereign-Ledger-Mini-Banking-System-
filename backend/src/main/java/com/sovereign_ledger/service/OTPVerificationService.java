package com.sovereign_ledger.service;

import com.sovereign_ledger.entity.OTPVerification;

import java.util.List;

public interface OTPVerificationService {
    public List<OTPVerification> findAllOTPs();
    public OTPVerification findOTPById(Integer id);
    public OTPVerification saveOTP(OTPVerification otp);
    public void deleteOTP(Integer id);
}

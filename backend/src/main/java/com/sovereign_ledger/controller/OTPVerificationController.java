package com.sovereign_ledger.controller;

import com.sovereign_ledger.entity.OTPVerification;
import com.sovereign_ledger.service.OTPVerificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/otp")
public class OTPVerificationController {
    private final OTPVerificationService otpVerificationService;

    public OTPVerificationController(OTPVerificationService otpVerificationService){
        this.otpVerificationService=otpVerificationService;
    }

    @GetMapping
    public List<OTPVerification> findAllOTPs(){
        return otpVerificationService.findAllOTPs();
    }

    @GetMapping("/otp-request/{id}")
    public OTPVerification findOTPByID(@PathVariable Integer id){
        return otpVerificationService.findOTPById(id);
    }

    @PutMapping
    public OTPVerification saveOTP(OTPVerification otp){
        return otpVerificationService.saveOTP(otp);
    }

    @DeleteMapping
    public void deleteOTP(Integer id){
        otpVerificationService.deleteOTP(id);
    }
}

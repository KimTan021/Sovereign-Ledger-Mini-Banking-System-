package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.entity.OTPVerification;
import com.sovereign_ledger.repository.OTPVerificationRepository;
import com.sovereign_ledger.repository.PendingUserRepository;
import com.sovereign_ledger.repository.TransactionRepository;
import com.sovereign_ledger.service.OTPVerificationService;
import com.sovereign_ledger.service.PendingUserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OTPVerificationServiceImplementation implements OTPVerificationService {
    private final OTPVerificationRepository otpVerificationRepository;
    private final TransactionRepository transactionRepository;
    private final PendingUserRepository pendingUserRepository;

    public OTPVerificationServiceImplementation(OTPVerificationRepository otpVerificationRepository,
                                                TransactionRepository transactionRepository,
                                                PendingUserRepository pendingUserRepository){
        this.otpVerificationRepository=otpVerificationRepository;
        this.transactionRepository=transactionRepository;
        this.pendingUserRepository=pendingUserRepository;
    }

    @Override
    public List<OTPVerification> findAllOTPs(){
        return otpVerificationRepository.findAll();
    }

    @Override
    public OTPVerification findOTPById(Integer id){
        return otpVerificationRepository.findById(id).orElse(null);
    }

    @Override
    public OTPVerification saveOTP(OTPVerification otp){
        return otpVerificationRepository.save(otp);
    }

    @Override
    public void deleteOTP(Integer id){
        otpVerificationRepository.deleteById(id);
    }

}

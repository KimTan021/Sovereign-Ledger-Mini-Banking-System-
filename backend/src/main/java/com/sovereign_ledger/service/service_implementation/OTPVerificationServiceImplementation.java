package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.response.OTPResponseDTO;
import com.sovereign_ledger.entity.OTPVerification;
import com.sovereign_ledger.entity.PendingUser;
import com.sovereign_ledger.entity.Transaction;
import com.sovereign_ledger.repository.OTPVerificationRepository;
import com.sovereign_ledger.repository.PendingUserRepository;
import com.sovereign_ledger.repository.TransactionRepository;
import com.sovereign_ledger.service.EmailService;
import com.sovereign_ledger.service.OTPVerificationService;
import com.sovereign_ledger.service.PendingUserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OTPVerificationServiceImplementation implements OTPVerificationService {
    private final OTPVerificationRepository otpVerificationRepository;
    private final TransactionRepository transactionRepository;
    private final PendingUserRepository pendingUserRepository;
    private final EmailService emailService;

    @Value("${otp.expiration.minutes}")
    private int otpExpirationMinutes;

    @Value("${otp.max.attempts}")
    private int otpMaxAttempts;

    @Value("${otp.resend.cooldown.minutes}")
    private int otpResendCooldownMinutes;

    public OTPVerificationServiceImplementation(OTPVerificationRepository otpVerificationRepository,
                                                TransactionRepository transactionRepository,
                                                PendingUserRepository pendingUserRepository,
                                                EmailService emailService) {
        this.otpVerificationRepository = otpVerificationRepository;
        this.transactionRepository = transactionRepository;
        this.pendingUserRepository = pendingUserRepository;
        this.emailService = emailService;
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

    // Generate and Send OTP

    @Override
    @Transactional
    public OTPResponseDTO generateAndSendOtp(String email, String purpose,
                                             PendingUser pendingUser, Transaction transaction) {

        otpVerificationRepository.findByEmailAndOtpPurpose(email, purpose)
                .ifPresent(existingOtp -> {
                    // Only apply cooldown if OTP is still active (not yet verified)
                    if (!existingOtp.getVerified()) {
                        LocalDateTime cooldownExpiry = existingOtp.getCreatedAt()
                                .plusMinutes(otpResendCooldownMinutes);
                        if (LocalDateTime.now().isBefore(cooldownExpiry)) {
                            throw new RuntimeException(
                                    "Please wait before requesting a new OTP");
                        }
                    }
                });
        // Delete any existing OTP for this email + purpose
        otpVerificationRepository.deleteByEmailAndOtpPurpose(email, purpose);

        // Generate fresh 6-digit OTP
        String otpCode = generateSixDigitOtp();

        // Build OTP record
        OTPVerification otp = new OTPVerification();
        otp.setEmail(email);
        otp.setOtpCode(otpCode);
        otp.setOtpPurpose(purpose);
        otp.setPendingUser(pendingUser);    // null if FUND_TRANSFER
        otp.setTransaction(transaction);    // null if EMAIL_VERIFICATION
        otp.setCreatedAt(LocalDateTime.now());
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes));
        otp.setVerified(false);
        otp.setAttempts(0);

        otpVerificationRepository.save(otp);

        // Send OTP email
        emailService.sendOtpEmail(email, otpCode, purpose);

        return new OTPResponseDTO(
                "OTP sent successfully to " + email,
                email,
                purpose,
                otp.getExpiresAt()
        );
    }


    // Verify OTP

    @Override
    @Transactional
    public OTPResponseDTO verifyOtp(String email, String otpCode, String purpose) {

        // 1. Find OTP record
        OTPVerification otp = otpVerificationRepository
                .findByEmailAndOtpPurpose(email, purpose)
                .orElseThrow(() -> new RuntimeException("No active OTP found for this email"));

        // 2. Already verified?
        if (otp.getVerified()) {
            throw new RuntimeException("OTP has already been used");
        }

        // 3. Expired?
        if (LocalDateTime.now().isAfter(otp.getExpiresAt())) {
            throw new RuntimeException("OTP has expired, please request a new one");
        }

        // 4. Attempts maxed out?
        if (otp.getAttempts() >= otpMaxAttempts) {
            throw new RuntimeException("OTP is locked, please request a new one");
        }

        // 5. Code matches?
        if (!otp.getOtpCode().equals(otpCode)) {
            otpVerificationRepository.incrementAttempts(email, purpose);

            int remainingAttempts = otpMaxAttempts - (otp.getAttempts() + 1);
            if (remainingAttempts == 0) {
                throw new RuntimeException("Invalid OTP, no tries remaining. Please request a new one");
            }
            throw new RuntimeException("Invalid OTP, " + remainingAttempts + " tries remaining");
        }

        // 6. All checks passed → mark as verified
        otp.setVerified(true);
        otpVerificationRepository.save(otp);

        return new OTPResponseDTO(
                "OTP verified successfully",
                email,
                purpose,
                otp.getExpiresAt()
        );
    }

    // Resend OTP
    @Override
    @Transactional
    public OTPResponseDTO resendOtp(String email, String purpose) {

        // Find existing OTP record
        OTPVerification existingOtp = otpVerificationRepository
                .findByEmailAndOtpPurpose(email, purpose)
                .orElseThrow(() -> new RuntimeException("No active OTP found, please register again"));

        // Check cooldown — prevent spamming resend
        LocalDateTime cooldownExpiry = existingOtp.getCreatedAt()
                .plusMinutes(otpResendCooldownMinutes);
        if (LocalDateTime.now().isBefore(cooldownExpiry)) {
            throw new RuntimeException("Please wait 1 minute before requesting a new OTP");
        }

        // Reuse same pendingUser/transaction reference
        PendingUser pendingUser = existingOtp.getPendingUser();
        Transaction transaction = existingOtp.getTransaction();

        // Generate and send fresh OTP
        return generateAndSendOtp(email, purpose, pendingUser, transaction);
    }

    // Generate 6-digit OTP

    private String generateSixDigitOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}

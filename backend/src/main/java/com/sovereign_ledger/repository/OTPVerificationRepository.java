package com.sovereign_ledger.repository;

import com.sovereign_ledger.entity.OTPVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OTPVerificationRepository extends JpaRepository<OTPVerification, Integer> {

    Optional<OTPVerification> findByEmailAndOtpPurpose(String email, String otpPurpose);

    void deleteByEmailAndOtpPurpose(String email, String otpPurpose);

    void deleteByExpiresAtBefore(LocalDateTime dateTime);

    @Modifying
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Query("UPDATE OTPVerification o SET o.attempts = o.attempts + 1 WHERE o.email = :email AND o.otpPurpose = :purpose")
    void incrementAttempts(@Param("email") String email, @Param("purpose") String purpose);
}

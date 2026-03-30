package com.sovereign_ledger.repository;

import com.sovereign_ledger.entity.OTPVerification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OTPVerificationRepository extends JpaRepository<OTPVerification, Integer> {
}

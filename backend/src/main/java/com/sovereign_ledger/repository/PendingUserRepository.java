package com.sovereign_ledger.repository;

import com.sovereign_ledger.entity.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PendingUserRepository extends JpaRepository<PendingUser, Integer> {
}

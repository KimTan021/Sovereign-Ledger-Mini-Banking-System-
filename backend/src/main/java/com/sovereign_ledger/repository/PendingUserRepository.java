package com.sovereign_ledger.repository;

import com.sovereign_ledger.entity.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PendingUserRepository extends JpaRepository<PendingUser, Integer> {

    boolean existsByUserEmailAndRequestStatusIgnoreCase(String userEmail, String requestStatus);
    boolean existsByPhoneAndRequestStatusIgnoreCase(String phone, String requestStatus);
    boolean existsByFirstNameIgnoreCaseAndMiddleNameIgnoreCaseAndLastNameIgnoreCaseAndRequestStatusIgnoreCase(
            String firstName, String middleName, String lastName, String requestStatus);
    List<PendingUser> findByUserEmailOrderByRequestTimeDesc(String userEmail);
    List<PendingUser> findByExistingUser_UserIdOrderByRequestTimeDesc(Integer userId);
    Page<PendingUser> findByRequestStatusIgnoreCaseOrderByRequestTimeDesc(String requestStatus, Pageable pageable);
}

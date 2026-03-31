package com.sovereign_ledger.repository;

import com.sovereign_ledger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByUserEmail(String userEmail);

    boolean existsByPhone(String phone);
    boolean existsByFirstNameIgnoreCaseAndMiddleNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String middleName, String lastName);
    boolean existsByUserEmail(String userEmail);
    List<User> findByPhone(String phone);
    List<User> findByFirstNameIgnoreCaseAndMiddleNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String middleName, String lastName);
}
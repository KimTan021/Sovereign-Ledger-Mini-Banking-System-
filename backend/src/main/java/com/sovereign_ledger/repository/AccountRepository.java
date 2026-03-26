package com.sovereign_ledger.repository;

import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface AccountRepository extends JpaRepository<Account, Integer> {

    Optional<Account> findByAccountNumber(String accountNumber);
}

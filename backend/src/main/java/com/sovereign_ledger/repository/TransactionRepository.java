package com.sovereign_ledger.repository;

import com.sovereign_ledger.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

}
package com.sovereign_ledger.repository;

import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    @Query(value = "SELECT u.user_id, t.* " +
            "FROM transaction AS t " +
            "INNER JOIN account AS a " +
            "ON t.account_id = a.account_id " +
            "INNER JOIN user as u " +
            "ON a.user_id = u.user_id " +
            "WHERE u.user_id = :id " +
            "ORDER BY t.transaction_time DESC;", nativeQuery = true)
    List<Transaction> findAllUserTransactions(@Param("id") Integer id); //Q1
    //Fetches all transactions from all accounts of a user, starting from latest transaction

    @Query(value = "SELECT COUNT(transaction_id) FROM transaction WHERE DATE(transaction_time) = DATE(NOW())", nativeQuery = true)
    Integer findTransactionVolumeToday(); //Q2
    //Fetch total number of transactions today (should refresh every set amount of time) (Added to Transaction Repository)
}
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

    @Query(value = "SELECT t.* FROM transaction as t " +
            "INNER JOIN account AS a  " +
            "ON t.account_id = a.account_id " +
            "INNER JOIN user as u " +
            " ON a.user_id = u.user_id " +
            "WHERE YEAR(transaction_time) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) " +
            "AND MONTH(transaction_time) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) " +
            "AND u.user_id = :id;", nativeQuery = true) //Q3
    List<Transaction> findAllTransactionsLastMonthById(@Param("id") Integer userId);
    //Fetch all transactions of a user from last month

    @Query(value = "SELECT SUM(t.transaction_amount) FROM transaction as t " +
            "INNER JOIN account AS a " +
            "ON t.account_id = a.account_id " +
            "INNER JOIN user as u " +
            "ON a.user_id = u.user_id " +
            "WHERE YEAR(transaction_time) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) " +
            "AND MONTH(transaction_time) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) " +
            "AND u.user_id = :id;", nativeQuery = true) //Q4
    Integer findSumAllTransactionsLastMonthById(@Param("id") Integer userId);
}
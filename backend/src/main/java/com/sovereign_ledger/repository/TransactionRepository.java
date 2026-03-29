package com.sovereign_ledger.repository;

import com.sovereign_ledger.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
    BigDecimal findSumAllTransactionsLastMonthById(@Param("id") Integer userId);
    //Fetch sum of all transaction of user from last month

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE account " +
            "SET account_balance = account_balance - :trans_amount " +
            "WHERE account_id = :src_accId AND account_balance >= :trans_amount ;", nativeQuery = true)
    Integer debitAccount(@Param("src_accId") Integer sourceAccountId, @Param("trans_amount") BigDecimal trans_amount);
    //Checks if specified account's balance is greater than transaction amount, should return 1 if yes, 0 if no
    //Q5

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE account " +
            "SET account_balance = account_balance + :trans_amount " +
            "WHERE account_id = :rec_accId;", nativeQuery = true)
    void creditAccount(@Param("rec_accId") Integer receivingAccountId, @Param("trans_amount") BigDecimal trans_amount);
    //Adds transaction amount to target account's balance, should only run after the query above
    //Q6

    @Modifying
    @Query(value =
            "INSERT INTO transaction (" +
                    "account_id, " +
                    "transaction_type, " +
                    "transaction_amount, " +
                    "account_id_destination, " +
                    "logs, " +
                    "transaction_time, " +
                    "transaction_description, " +
                    "transaction_status, " +
                    "target_account_number, " +
                    "target_account_name) " +
            "VALUES " +
                "(:src_acctId, " +
                ":trans_type, " +
                ":trans_amount, " +
                ":targ_acctId, " +
                ":logs, " +
                "NOW(), " +
                ":trans_desc, " +
                ":trans_status, " +
                ":targ_acctNum, " +
                ":targ_acctName);", nativeQuery = true)
    void insertNewTransactionLog(@Param("src_acctId") Integer sourceAccountId,
                                 @Param("trans_type") String transactionType,
                                 @Param("trans_amount") BigDecimal transactionAmount,
                                 @Param("targ_acctId") Integer targetAccountId,
                                 @Param("logs") String logs,
                                 @Param("trans_desc") String transactionDescription,
                                 @Param("trans_status") String transactionStatus,
                                 @Param("targ_acctNum") String targetAccountNumber,
                                 @Param("targ_acctName") String targetAccountName
                                 );
    //Query for creating transactions
    //Q7

    @Modifying
    @Query(value =
            "INSERT INTO transaction (" +
                    "account_id, " +
                    "transaction_type, " +
                    "transaction_amount, " +
                    "account_id_destination, " +
                    "logs, " +
                    "transaction_time, " +
                    "transaction_description, " +
                    "transaction_status, " +
                    "target_account_number, " +
                    "target_account_name) " +
                    "VALUES " +
                    "(:src_acctId, " +
                    ":trans_type, " +
                    ":trans_amount, " +
                    ":targ_acctId, " +
                    ":logs, " +
                    ":trans_time, " +
                    ":trans_desc, " +
                    ":trans_status, " +
                    ":targ_acctNum, " +
                    ":targ_acctName);", nativeQuery = true)
    void insertNewTransactionLogWithDate(@Param("src_acctId") Integer sourceAccountId,
                                 @Param("trans_type") String transactionType,
                                 @Param("trans_amount") BigDecimal transactionAmount,
                                 @Param("targ_acctId") Integer targetAccountId,
                                 @Param("logs") String logs,
                                 @Param("trans_time") LocalDateTime transactionTime,
                                 @Param("trans_desc") String transactionDescription,
                                 @Param("trans_status") String transactionStatus,
                                 @Param("targ_acctNum") String targetAccountNumber,
                                 @Param("targ_acctName") String targetAccountName
    );
    //Query for creating transactions
    //Q7

    @Query(value = "SELECT DATE(transaction_time) as category, COUNT(transaction_id) as value FROM transaction WHERE transaction_time >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(transaction_time) ORDER BY DATE(transaction_time) ASC", nativeQuery = true)
    List<Object[]> getDailyTransactionVolumePulsar();

    @Query(value = "SELECT transaction_type as category, COUNT(transaction_id) as value FROM transaction GROUP BY transaction_type ORDER BY value DESC", nativeQuery = true)
    List<Object[]> getTransactionTypeDistribution();

    List<Transaction> findTop5ByOrderByTransactionTimeDesc();

    List<Transaction> findAllByOrderByTransactionTimeDesc();

    Optional<Transaction> findTopByAccount_AccountIdOrderByTransactionTimeDesc(Integer accountId);
}

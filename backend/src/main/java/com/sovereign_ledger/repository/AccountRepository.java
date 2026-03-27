package com.sovereign_ledger.repository;

import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Integer> {

    Optional<Account> findByAccountNumber(String accountNumber);

    @Query(value =
            "SELECT a.* " +
            "FROM account AS a " +
            "INNER JOIN user AS u ON a.user_id = u.user_id " +
            "WHERE u.user_id = :id", nativeQuery = true)
    List<Account> findAllAccountsByUserId(@Param("id") Integer userId);
    // Query meant for fetching all accounts associated with a userId (Q1)

    @Query(value = "SELECT SUM(account_balance) FROM account WHERE user_id = :id", nativeQuery = true)
    BigDecimal findTotalAccountBalanceByUserId(@Param("id") Integer userId);
    // Query for fetching sum of balances of all accounts under a user (Q2)

    @Query(value = "SELECT account_balance FROM account WHERE user_id = :uid AND account_id = :aid", nativeQuery = true)
    BigDecimal findAccountBalanceByUserIdAndAccountId(@Param("uid") Integer userId, @Param("aid") Integer accountId);
    // Query for fetching balance of a user's specific account (Q3)

    @Query(value = "SELECT COUNT(user_id) FROM user WHERE role='user'", nativeQuery = true)
    Integer findTotalUserAccounts();
    // Query for fetching total number of users, excluding admins (Q4)

    @Query(value = "SELECT SUM(account_balance) FROM account", nativeQuery = true)
    BigDecimal findTotalLiquidity();
    // Query for a placeholder for total liquidity, not meant to represent bank actual liquidity (Q5)

    @Query(value = "SELECT u.first_name, u.last_name, a.account_balance " +
            "FROM account as a " +
            "INNER JOIN user as u " +
            "ON a.user_id = u.user_id " +
            "ORDER BY a.account_balance DESC " +
            "LIMIT 3;", nativeQuery = true)
    List<TopAccountDTO> findTop3MostValuableAccounts(); //Q6
    // Fetch top 3 most valuable accounts (For DTO, when dded, include name, account_status, account_balance)
}


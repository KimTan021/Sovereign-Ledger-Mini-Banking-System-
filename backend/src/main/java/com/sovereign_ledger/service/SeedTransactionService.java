package com.sovereign_ledger.service;

import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.repository.AccountRepository;
import com.sovereign_ledger.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Random;

@Service
public class SeedTransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final Random random = new Random();

    private static final String[] TYPES        = {"credit", "debit"};
    private static final String[] DESCRIPTIONS = {
            "Salary deposit", "Grocery payment", "Utility bill",
            "Online purchase", "Mobile top-up", "Insurance premium",
            "ATM withdrawal", "Loan repayment", "Freelance income",
            "Subscription fee"
    };
    private static final String[] STATUSES = {"Completed", "Completed", "Completed", "Pending"};

    public SeedTransactionService(AccountRepository accountRepository,
                                  TransactionRepository transactionRepository) {
        this.accountRepository   = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Seeds transactions for the first 3 users in the provided approved-user ID list.
     * Each user receives 3–5 transactions per month for the current month and the
     * 3 months prior, spread across their available accounts.
     * Guards against double-seeding: skips any account that already has transactions.
     */
    @Transactional
    public void seedForApprovedUsers(List<Integer> approvedUserIds) {

        // Limit to first 3 users
        List<Integer> targets = approvedUserIds.stream().limit(3).toList();

        // Current month and 3 months back (oldest first)
        YearMonth current = YearMonth.now();
        List<YearMonth> months = List.of(
                current.minusMonths(3),
                current.minusMonths(2),
                current.minusMonths(1),
                current
        );

        for (Integer userId : targets) {
            List<Account> accounts = accountRepository.findAllAccountsByUserId(userId);
            if (accounts.isEmpty()) continue;

            // Guard: skip if this user's first account already has transactions
            boolean alreadySeeded = !transactionRepository
                    .findAllUserTransactions(userId)
                    .isEmpty();
            if (alreadySeeded) continue;

            for (YearMonth month : months) {
                int txCount = 3 + random.nextInt(3); // 3, 4, or 5

                for (int i = 0; i < txCount; i++) {
                    Account account = accounts.get(i % accounts.size()); // round-robin
                    String  type    = TYPES[random.nextInt(TYPES.length)];
                    String  desc    = DESCRIPTIONS[random.nextInt(DESCRIPTIONS.length)];
                    String  status  = STATUSES[random.nextInt(STATUSES.length)];
                    BigDecimal amount = BigDecimal.valueOf(100 + random.nextInt(8901)); // 100–9000

                    // Pick a random day within the month (day 1 – last day of month)
                    int day = 1 + random.nextInt(month.lengthOfMonth());
                    int hour   = random.nextInt(24);
                    int minute = random.nextInt(60);
                    LocalDateTime txTime = month.atDay(day).atTime(hour, minute, 0);

                    String logs = String.format("[SEED] %s of %.2f on account #%d at %s",
                            type.toUpperCase(), amount, account.getAccountId(), txTime);

                    transactionRepository.insertNewTransactionLogWithDate(
                            account.getAccountId(),
                            type,
                            amount,
                            null,
                            logs,
                            txTime,
                            desc,
                            status,
                            null,
                            null
                    );
                }
            }
        }
    }
}
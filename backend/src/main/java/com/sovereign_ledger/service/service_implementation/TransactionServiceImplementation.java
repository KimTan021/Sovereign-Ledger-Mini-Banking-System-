package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.response.TransactionResponseDTO;
import com.sovereign_ledger.dto.response.UserResponseDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.entity.Transaction;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.exception.exception_classes.AccountNotVerifiedException;
import com.sovereign_ledger.exception.exception_classes.InsufficientBalanceException;
import com.sovereign_ledger.repository.TransactionRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.AccountService;
import com.sovereign_ledger.service.NotificationService;
import com.sovereign_ledger.service.TransactionService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionServiceImplementation implements TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    @org.springframework.beans.factory.annotation.Value("${aes.secret-key}")
    private String aesSecretKey;

    public TransactionServiceImplementation(
            TransactionRepository transactionRepository,
            AccountService accountService,
            NotificationService notificationService,
            UserRepository userRepository){
        this.transactionRepository = transactionRepository;
        this.accountService = accountService;
        this.notificationService = notificationService;
        this.userRepository=userRepository;
    }

    private TransactionResponseDTO toTransactionResponseDTO(Transaction transaction){
        if (transaction == null) return null;
        
        String targetAcc = transaction.getTargetAccountNumber();
        if (targetAcc != null && !targetAcc.isBlank()) {
            try {
                targetAcc = com.sovereign_ledger.util.AesEncryptionUtil.decrypt(targetAcc, aesSecretKey);
            } catch (Exception e) {
                // Return as is if decryption fails (e.g. legacy data)
            }
        }

        return new TransactionResponseDTO(
                transaction.getTransactionId(),
                transaction.getAccount().getAccountId(),
                transaction.getTransactionType(),
                transaction.getTransactionAmount(),
                transaction.getAccountIdDestination(),
                transaction.getLogs(),
                transaction.getTransactionTime(),
                transaction.getTransactionDescription(),
                transaction.getTransactionStatus(),
                targetAcc,
                transaction.getTargetAccountName(),
                transaction.getReviewNote()
        );
    }

    @Override
    public List<TransactionResponseDTO> findAllTransactions(){
        return transactionRepository.findAll()
                .stream()
                .map(this::toTransactionResponseDTO)
                .toList();
    }

    @Override
    public TransactionResponseDTO findTransactionById(Integer id){
        Transaction transaction = transactionRepository.findById(id).orElse(null);
        return toTransactionResponseDTO(transaction);
    }

    @Override
    public List<TransactionResponseDTO> findAllUserTransactions(Integer id){
        User userCheck = userRepository.findById(id).orElse(null);

        String userCurrent = SecurityContextHolder.getContext().getAuthentication().getName();

        if(!userCheck.getUserEmail().equals(userCurrent)){
            throw new IllegalArgumentException("You do not have permission to view this user's transactions.");
        }

        return transactionRepository.findAllUserTransactions(id)
                .stream()
                .map(this::toTransactionResponseDTO)
                .toList();
    }

    @Override
    public Integer findTransactionVolumeToday(){
        return transactionRepository.findTransactionVolumeToday();
    }

    @Override
    public List<TransactionResponseDTO> findAllTransactionsLastMonthById(Integer id){
        return transactionRepository.findAllTransactionsLastMonthById(id)
                .stream()
                .map(this::toTransactionResponseDTO)
                .toList();
    }

    @Override
    public BigDecimal findSumAllTransactionsLastMonthById(Integer id){
        return transactionRepository.findSumAllTransactionsLastMonthById(id);
    }

    @Override
    public TransactionResponseDTO saveTransaction(Transaction transaction){
        return toTransactionResponseDTO(transactionRepository.save(transaction));
    }

    @Override
    public void insertNewTransactionLog(Integer sourceAccountId,
                                     String transactionType,
                                     BigDecimal transactionAmount,
                                     Integer targetAccountId,
                                     String logs,
                                     String transactionDescription,
                                     String transactionStatus,
                                     String targetAccountNumber,
                                     String targetAccountName) {
        transactionRepository.insertNewTransactionLog(
                sourceAccountId,
                transactionType,
                transactionAmount,
                targetAccountId,
                logs,
                transactionDescription,
                transactionStatus,
                targetAccountNumber,
                targetAccountName
        );
    }

    @Override
    public void insertNewTransactionLogWithDate(Integer sourceAccountId,
                                                String transactionType,
                                                BigDecimal transactionAmount,
                                                Integer targetAccountId,
                                                String logs,
                                                LocalDateTime transactionTime,
                                                String transactionDescription,
                                                String transactionStatus,
                                                String targetAccountNumber,
                                                String targetAccountName) {
        transactionRepository.insertNewTransactionLogWithDate(
                sourceAccountId,
                transactionType,
                transactionAmount,
                targetAccountId,
                logs,
                transactionTime,
                transactionDescription,
                transactionStatus,
                targetAccountNumber,
                targetAccountName
        );
    }

    @Override
    public void deleteTransaction(Integer id){
        transactionRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void initiateTransaction(
            Account sourceAccount,
            Account receivingAccount,
            BigDecimal transAmount,
            String logs,
            String transactionDescription
            ) {
        Account managedSourceAccount = accountService.findAccountEntityById(sourceAccount.getAccountId());
        Account managedReceivingAccount = accountService.findAccountEntityById(receivingAccount.getAccountId());
        String sourceAccountType = managedSourceAccount.getAccountType();
        String sourceAccountNumber = managedSourceAccount.getAccountNumber();
        String receivingAccountType = managedReceivingAccount.getAccountType();
        String receivingAccountNumber = managedReceivingAccount.getAccountNumber();
        Integer receivingUserId = managedReceivingAccount.getUser().getUserId();
        String sourceAccountOwnerName = managedSourceAccount.getUser().getFirstName() + " " + managedSourceAccount.getUser().getLastName();
        String receivingAccountName = managedReceivingAccount.getUser().getFirstName() + " " + managedReceivingAccount.getUser().getLastName();

        if ((!managedSourceAccount.getAccountStatus().equals("Verified")) || (!managedReceivingAccount.getAccountStatus().equals("Verified"))){
            throw new AccountNotVerifiedException("An account involved in the transaction is currently unverified. Transaction cannot proceed unless all accounts involved are verified.");
        }

        int affectedAccounts = transactionRepository.debitAccount(managedSourceAccount.getAccountId(), transAmount);

        if(affectedAccounts == 0){
            throw new InsufficientBalanceException("Your account's balance is insufficient for this transaction.");
        }

        transactionRepository.creditAccount(managedReceivingAccount.getAccountId(), transAmount);

        String sourceAccRaw = sourceAccountNumber;
        String receivingAccRaw = receivingAccountNumber;
        try {
            sourceAccRaw = com.sovereign_ledger.util.AesEncryptionUtil.decrypt(sourceAccountNumber, aesSecretKey);
            receivingAccRaw = com.sovereign_ledger.util.AesEncryptionUtil.decrypt(receivingAccountNumber, aesSecretKey);
        } catch (Exception e) {
            // Fallback to encrypted if decryption fails
        }

        transactionRepository.insertNewTransactionLog(
                managedSourceAccount.getAccountId(),
                "debit",
                transAmount,
                managedReceivingAccount.getAccountId(),
                "Transfer from " + sourceAccountType + " account " + sourceAccRaw + " to " + receivingAccountType + " account " + receivingAccRaw,
                transactionDescription,
                "Completed",
                receivingAccountNumber,
                receivingAccountName
                );

        transactionRepository.insertNewTransactionLog(
                managedReceivingAccount.getAccountId(),
                "credit",
                transAmount,
                null,
                "Transfer received from " + sourceAccountType + " account " + sourceAccRaw,
                transactionDescription,
                "Completed",
                null,
                null
        );

        Transaction latestIncomingTransaction = transactionRepository
                .findTopByAccount_AccountIdOrderByTransactionTimeDesc(managedReceivingAccount.getAccountId())
                .orElse(null);
        notificationService.createNotification(
                receivingUserId,
                managedReceivingAccount.getAccountId(),
                latestIncomingTransaction == null ? null : latestIncomingTransaction.getTransactionId(),
                "incoming-transfer",
                "Incoming transfer received",
                "You received PHP " + transAmount + " in your " + receivingAccountType + " account from " + sourceAccountOwnerName + "."
        );
        notificationService.emitDataChange("accounts", "transactions", "notifications", "admin");
    }

    @Override
    @Transactional
    public void depositToAccount(Integer accountId, BigDecimal transAmount, String transactionDescription) {
        Account managedAccount = accountService.findAccountEntityById(accountId);

        String callerEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        if(!managedAccount.getUser().getUserEmail().equals(callerEmail)){
            throw new IllegalArgumentException("You do not have permission to to transfer funds from this account");
        }

        if (!"Verified".equals(managedAccount.getAccountStatus())) {
            throw new AccountNotVerifiedException("This account is currently unverified. Deposit cannot proceed.");
        }

        String accNumRaw = managedAccount.getAccountNumber();
        try {
            accNumRaw = com.sovereign_ledger.util.AesEncryptionUtil.decrypt(accNumRaw, aesSecretKey);
        } catch (Exception e) {}

        transactionRepository.creditAccount(managedAccount.getAccountId(), transAmount);
        transactionRepository.insertNewTransactionLog(
                managedAccount.getAccountId(),
                "credit",
                transAmount,
                null,
                "Deposit posted to " + managedAccount.getAccountType() + " account " + accNumRaw,
                transactionDescription,
                "Completed",
                null,
                null
        );
        notificationService.emitDataChange("accounts", "transactions", "admin");
    }

    @Override
    @Transactional
    public void withdrawFromAccount(Integer accountId, BigDecimal transAmount, String transactionDescription) {
        Account managedAccount = accountService.findAccountEntityById(accountId);

        if (!"Verified".equals(managedAccount.getAccountStatus())) {
            throw new AccountNotVerifiedException("This account is currently unverified. Withdrawal cannot proceed.");
        }

        int affectedAccounts = transactionRepository.debitAccount(managedAccount.getAccountId(), transAmount);
        if (affectedAccounts == 0) {
            throw new InsufficientBalanceException("Your account's balance is insufficient for this withdrawal.");
        }

        String accNumRaw = managedAccount.getAccountNumber();
        try {
            accNumRaw = com.sovereign_ledger.util.AesEncryptionUtil.decrypt(accNumRaw, aesSecretKey);
        } catch (Exception e) {}

        transactionRepository.insertNewTransactionLog(
                managedAccount.getAccountId(),
                "debit",
                transAmount,
                null,
                "Withdrawal from " + managedAccount.getAccountType() + " account " + accNumRaw,
                transactionDescription,
                "Completed",
                null,
                null
        );
        notificationService.emitDataChange("accounts", "transactions", "admin");
    }
}

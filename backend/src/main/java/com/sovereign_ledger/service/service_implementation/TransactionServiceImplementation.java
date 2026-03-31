package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.response.OTPResponseDTO;
import com.sovereign_ledger.dto.response.TransactionResponseDTO;
import com.sovereign_ledger.dto.response.UserResponseDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.entity.Transaction;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.exception.exception_classes.AccountNotVerifiedException;
import com.sovereign_ledger.exception.exception_classes.InsufficientBalanceException;
import com.sovereign_ledger.repository.OTPVerificationRepository;
import com.sovereign_ledger.repository.TransactionRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.AccountService;
import com.sovereign_ledger.service.NotificationService;
import com.sovereign_ledger.service.OTPVerificationService;
import com.sovereign_ledger.service.TransactionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TransactionServiceImplementation implements TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final OTPVerificationRepository otpVerificationRepository;
    private final OTPVerificationService otpVerificationService;
    @org.springframework.beans.factory.annotation.Value("${aes.secret-key}")
    private String aesSecretKey;

    @Value("${otp.max.attempts}")
    private int otpMaxAttempts;

    public TransactionServiceImplementation(
            TransactionRepository transactionRepository,
            AccountService accountService,
            NotificationService notificationService,
            UserRepository userRepository,
            OTPVerificationRepository otpVerificationRepository,
            OTPVerificationService otpVerificationService){
        this.transactionRepository = transactionRepository;
        this.accountService = accountService;
        this.notificationService = notificationService;
        this.userRepository=userRepository;
        this.otpVerificationRepository=otpVerificationRepository;
        this.otpVerificationService=otpVerificationService;
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

        boolean roleCheck = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if(!roleCheck && !userCheck.getUserEmail().equals(userCurrent)){
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
    public OTPResponseDTO initiateTransaction(
            Account sourceAccount,
            Account receivingAccount,
            BigDecimal transAmount,
            String logs,
            String transactionDescription,
            String userEmail
            ) {
        Account managedSourceAccount = accountService.findAccountEntityById(sourceAccount.getAccountId());
        Account managedReceivingAccount = accountService.findAccountEntityById(receivingAccount.getAccountId());

        if ((!managedSourceAccount.getAccountStatus().equals("Verified")) || (!managedReceivingAccount.getAccountStatus().equals("Verified"))){
            throw new AccountNotVerifiedException("An account involved in the transaction is currently unverified. Transaction cannot proceed unless all accounts involved are verified.");
        }

        if (managedSourceAccount.getAccountBalance().compareTo(transAmount) < 0) {
            throw new InsufficientBalanceException("Your account's balance is insufficient for this transaction.");
        }

        transactionRepository
                .findTopByAccount_User_UserEmailAndTransactionStatusOrderByTransactionTimeDesc(
                        userEmail, "Pending_OTP")
                .ifPresent(t -> {
                    // Check if associated OTP is expired or locked
                    otpVerificationRepository
                            .findByEmailAndOtpPurpose(userEmail, "FUND_TRANSFER")
                            .ifPresentOrElse(existingOtp -> {
                                boolean isExpired = LocalDateTime.now().isAfter(existingOtp.getExpiresAt());
                                boolean isLocked = existingOtp.getAttempts() >= otpMaxAttempts;

                                if (isExpired || isLocked) {
                                    // Auto-cancel the stale transaction and delete OTP
                                    t.setTransactionStatus("Cancelled");
                                    transactionRepository.save(t);
                                    otpVerificationRepository.delete(existingOtp);
                                } else {
                                    throw new RuntimeException(
                                            "You have a pending transfer awaiting OTP verification.");
                                }
                            }, () -> {
                                // No OTP found but transaction is still Pending_OTP — auto cancel it
                                t.setTransactionStatus("Cancelled");
                                transactionRepository.save(t);
                            });
                });

        // ── Create Pending_OTP transaction record ──
        Transaction transaction = new Transaction();
        transaction.setAccount(managedSourceAccount);
        transaction.setTransactionType("debit");
        transaction.setTransactionAmount(transAmount);
        transaction.setAccountIdDestination(managedReceivingAccount.getAccountId());
        transaction.setLogs(logs);
        transaction.setTransactionTime(LocalDateTime.now());
        transaction.setTransactionDescription(transactionDescription);
        transaction.setTransactionStatus("Pending_OTP");
        transaction.setTargetAccountNumber(managedReceivingAccount.getAccountNumber());
        transaction.setTargetAccountName(
                managedReceivingAccount.getUser().getFirstName() + " " +
                        managedReceivingAccount.getUser().getLastName());

        Transaction savedTransaction = transactionRepository.save(transaction);

        // ── Generate and send OTP ──
        return otpVerificationService.generateAndSendOtp(
                userEmail,
                "FUND_TRANSFER",
                null,
                savedTransaction
        );
    }

    // Verify Transfer OTP

    @Override
    @Transactional
    public OTPResponseDTO verifyTransferOtp(String email, String otpCode) {

        // 1. Verify OTP
        OTPResponseDTO response = otpVerificationService.verifyOtp(
                email, otpCode, "FUND_TRANSFER");

        // 2. Find the Pending_OTP transaction
        Transaction pendingTransaction = transactionRepository
                .findTopByAccount_User_UserEmailAndTransactionStatusOrderByTransactionTimeDesc(
                        email, "Pending_OTP")
                .orElseThrow(() -> new RuntimeException(
                        "No pending transfer found."));

        Account managedSourceAccount = accountService.findAccountEntityById(
                pendingTransaction.getAccount().getAccountId());
        Account managedReceivingAccount = accountService.findAccountEntityById(
                pendingTransaction.getAccountIdDestination());

        String sourceAccountType = managedSourceAccount.getAccountType();
        String receivingAccountType = managedReceivingAccount.getAccountType();
        Integer receivingUserId = managedReceivingAccount.getUser().getUserId();
        String sourceAccountOwnerName = managedSourceAccount.getUser().getFirstName() + " " +
                managedSourceAccount.getUser().getLastName();
        String receivingAccountName = managedReceivingAccount.getUser().getFirstName() + " " +
                managedReceivingAccount.getUser().getLastName();
        BigDecimal transAmount = pendingTransaction.getTransactionAmount();

        // 3. Execute debit
        int affectedAccounts = transactionRepository.debitAccount(
                managedSourceAccount.getAccountId(), transAmount);
        if (affectedAccounts == 0) {
            throw new InsufficientBalanceException(
                    "Your account's balance is insufficient for this transaction.");
        }

        // 4. Execute credit
        transactionRepository.creditAccount(
                managedReceivingAccount.getAccountId(), transAmount);

        // 5. Decrypt account numbers for logs
        String sourceAccRaw = managedSourceAccount.getAccountNumber();
        String receivingAccRaw = managedReceivingAccount.getAccountNumber();
        try {
            sourceAccRaw = com.sovereign_ledger.util.AesEncryptionUtil.decrypt(
                    sourceAccRaw, aesSecretKey);
            receivingAccRaw = com.sovereign_ledger.util.AesEncryptionUtil.decrypt(
                    receivingAccRaw, aesSecretKey);
        } catch (Exception e) { }

        // 6. Update Pending_OTP transaction to Completed (debit side)
        pendingTransaction.setTransactionStatus("Completed");
        pendingTransaction.setLogs("Transfer from " + sourceAccountType + " account " +
                sourceAccRaw + " to " + receivingAccountType + " account " + receivingAccRaw);
        transactionRepository.save(pendingTransaction);

        // 7. Create credit transaction log for receiving account
        transactionRepository.insertNewTransactionLog(
                managedReceivingAccount.getAccountId(),
                "credit",
                transAmount,
                null,
                "Transfer received from " + sourceAccountType + " account " + sourceAccRaw,
                pendingTransaction.getTransactionDescription(),
                "Completed",
                null,
                null
        );

        // 8. Send notification
        Transaction latestIncomingTransaction = transactionRepository
                .findTopByAccount_AccountIdOrderByTransactionTimeDesc(
                        managedReceivingAccount.getAccountId())
                .orElse(null);

        notificationService.createNotification(
                receivingUserId,
                managedReceivingAccount.getAccountId(),
                latestIncomingTransaction == null ? null :
                        latestIncomingTransaction.getTransactionId(),
                "incoming-transfer",
                "Incoming transfer received",
                "You received PHP " + transAmount + " in your " + receivingAccountType +
                        " account from " + sourceAccountOwnerName + "."
        );

        notificationService.emitDataChange("accounts", "transactions", "notifications", "admin");

        return response;
    }

    // Resend Transfer OTP

    @Override
    public OTPResponseDTO resendTransferOtp(String email) {

        // Check there is a Pending_OTP transaction for this user
        Transaction pendingTransaction = transactionRepository
                .findTopByAccount_User_UserEmailAndTransactionStatusOrderByTransactionTimeDesc(
                        email, "Pending_OTP")
                .orElseThrow(() -> new RuntimeException(
                        "No pending transfer found for this email."));

        // Delegate to OTP service — reuses existing resend logic
        return otpVerificationService.resendOtp(email, "FUND_TRANSFER");
    }

    @Override
    @Transactional
    public Map<String, String> cancelTransferOtp(String email) {

        // 1. Find the Pending_OTP transaction
        Transaction pendingTransaction = transactionRepository
                .findTopByAccount_User_UserEmailAndTransactionStatusOrderByTransactionTimeDesc(
                        email, "Pending_OTP")
                .orElseThrow(() -> new RuntimeException(
                        "No pending transfer found for this email."));

        // 2. Cancel the transaction
        pendingTransaction.setTransactionStatus("Cancelled");
        transactionRepository.save(pendingTransaction);

        // 3. Delete the OTP row
        otpVerificationRepository.deleteByEmailAndOtpPurpose(email, "FUND_TRANSFER");

        return Map.of(
                "message", "Transaction cancelled successfully",
                "status", "Cancelled"
        );

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

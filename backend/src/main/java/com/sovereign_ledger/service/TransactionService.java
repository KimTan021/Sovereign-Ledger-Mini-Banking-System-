package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.response.OTPResponseDTO;
import com.sovereign_ledger.dto.response.TransactionResponseDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.entity.Transaction;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface TransactionService {
    List<TransactionResponseDTO> findAllTransactions();
    TransactionResponseDTO findTransactionById(Integer id);
    List<TransactionResponseDTO> findAllUserTransactions(Integer id);
    Integer findTransactionVolumeToday();
    List<TransactionResponseDTO> findAllTransactionsLastMonthById(Integer id);
    BigDecimal findSumAllTransactionsLastMonthById(Integer id);

    TransactionResponseDTO saveTransaction(Transaction transaction);

    void insertNewTransactionLog(
            Integer sourceAccountId,
            String transactionType,
            BigDecimal transactionAmount,
            Integer targetAccountId,
            String logs,
            String transactionDescription,
            String transactionStatus,
            String targetAccountNumber,
            String targetAccountName);

    void insertNewTransactionLogWithDate(
            Integer sourceAccountId,
            String transactionType,
            BigDecimal transactionAmount,
            Integer targetAccountId,
            String logs,
            LocalDateTime transactionTime,
            String transactionDescription,
            String transactionStatus,
            String targetAccountNumber,
            String targetAccountName);

    void deleteTransaction(Integer id);

    OTPResponseDTO initiateTransaction(
            Account sourceAccount,
            Account receivingAccount,
            BigDecimal transAmount,
            String logs,
            String transactionDescription,
            String userEmail);

    OTPResponseDTO verifyTransferOtp(
            String email,
            String otpCode);

    OTPResponseDTO resendTransferOtp(
            String email);

    Map<String, String> cancelTransferOtp(
            String email);

    void depositToAccount(
            Integer accountId,
            BigDecimal transAmount,
            String transactionDescription
    );

    void withdrawFromAccount(
            Integer accountId,
            BigDecimal transAmount,
            String transactionDescription
    );
}

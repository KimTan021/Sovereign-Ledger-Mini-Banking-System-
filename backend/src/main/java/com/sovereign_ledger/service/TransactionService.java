package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.dto.response.TransactionResponseDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.entity.Transaction;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
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
            String transactionStatus);

    void deleteTransaction(Integer id);

    void initiateTransaction(
            Account sourceAccount,
            Account receivingAccount,
            BigDecimal transAmount,
            String logs,
            String transactionDescription
    );
}

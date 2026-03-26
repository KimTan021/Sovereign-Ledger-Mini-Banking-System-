package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Transaction;

import java.util.List;

public interface TransactionService {
    List<Transaction> findAllTransactions();
    Transaction findTransactionById(Integer id);
    List<Transaction> findAllUserTransactions(Integer id);
    Integer findTransactionVolumeToday();
    Transaction saveTransaction(Transaction transaction);
    void deleteTransaction(Integer id);
}

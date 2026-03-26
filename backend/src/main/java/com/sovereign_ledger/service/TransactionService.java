package com.sovereign_ledger.service;

import com.sovereign_ledger.entity.Transaction;

import java.util.List;

public interface TransactionService {
    List<Transaction> findAllTransactions();
    Transaction findTransactionById(Integer id);
    Transaction saveTransaction(Transaction transaction);
    void deleteTransaction(Integer id);
}

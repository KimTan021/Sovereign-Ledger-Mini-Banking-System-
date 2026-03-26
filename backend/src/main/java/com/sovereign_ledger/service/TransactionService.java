package com.sovereign_ledger.service;

import com.sovereign_ledger.entity.Transaction;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface TransactionService {
    List<Transaction> findAllTransactions();
    Transaction findTransactionById(Integer id);
    Transaction saveTransaction(Transaction transaction);
    void deleteTransaction(Integer id);
}

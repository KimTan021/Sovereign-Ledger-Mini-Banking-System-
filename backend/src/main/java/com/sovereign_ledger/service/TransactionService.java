package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Transaction;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface TransactionService {
    List<Transaction> findAllTransactions();
    Transaction findTransactionById(Integer id);
    List<Transaction> findAllUserTransactions(Integer id);
    Integer findTransactionVolumeToday();
    List<Transaction> findAllTransactionsLastMonthById(Integer id);
    Integer findSumAllTransactionsLastMonthById(Integer id);
    Transaction saveTransaction(Transaction transaction);
    void deleteTransaction(Integer id);
}

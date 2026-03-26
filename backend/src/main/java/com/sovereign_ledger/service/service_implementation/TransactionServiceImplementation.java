package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Transaction;
import com.sovereign_ledger.repository.AccountRepository;
import com.sovereign_ledger.repository.TransactionRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.TransactionService;

import java.math.BigDecimal;
import java.util.List;

public class TransactionServiceImplementation implements TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public TransactionServiceImplementation(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            UserRepository userRepository){
        this.transactionRepository=transactionRepository;
        this.accountRepository=accountRepository;
        this.userRepository=userRepository;
    }

    public List<Transaction> findAllTransactions(){
        return transactionRepository.findAll();
    }

    public Transaction findTransactionById(Integer id){
        return transactionRepository.findById(id).orElse(null);
    }

    public List<Transaction> findAllUserTransactions(Integer id){
        return transactionRepository.findAllUserTransactions(id);
    } //Q1

    public Integer findTransactionVolumeToday(){
        return transactionRepository.findTransactionVolumeToday();
    } //Q2

    public Transaction saveTransaction(Transaction transaction){
        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Integer id){
        transactionRepository.deleteById(id);
    }
}

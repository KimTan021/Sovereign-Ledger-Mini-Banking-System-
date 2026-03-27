package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.entity.Transaction;
import com.sovereign_ledger.exception.exception_classes.AccountNotVerifiedException;
import com.sovereign_ledger.exception.exception_classes.InsufficientBalanceException;
import com.sovereign_ledger.repository.AccountRepository;
import com.sovereign_ledger.repository.TransactionRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.TransactionService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
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

    public List<Transaction> findAllTransactionsLastMonthById(Integer id){
        return transactionRepository.findAllTransactionsLastMonthById(id);
    } //Q3

    public Integer findSumAllTransactionsLastMonthById(Integer id){
        return transactionRepository.findSumAllTransactionsLastMonthById(id);
    } //Q4

    public Transaction saveTransaction(Transaction transaction){
        return transactionRepository.save(transaction);
    }

    public void insertNewTransactionLog(Integer sourceAccountId,
                                     String transactionType,
                                     BigDecimal transactionAmount,
                                     Integer targetAccountId,
                                     String logs,
                                     String transactionDescription,
                                     String transactionStatus) {
        transactionRepository.insertNewTransactionLog(
                sourceAccountId,
                transactionType,
                transactionAmount,
                targetAccountId,
                logs,
                transactionDescription,
                transactionStatus
        );
    } //Q7

    public void deleteTransaction(Integer id){
        transactionRepository.deleteById(id);
    }

    @Transactional
    public void initiateTransaction(
            Account sourceAccount,
            Account receivingAccount,
            BigDecimal transAmount,
            String logs,
            String transactionDescription
            ) {
        if ((!sourceAccount.getAccountStatus().equals("VERIFIED")) || (!receivingAccount.getAccountStatus().equals("VERIFIED"))){
            throw new AccountNotVerifiedException("An account involved in the transaction is currently unverified. Transaction cannot proceed unless all accounts involved are verified.");
        }

        int affectedAccounts = transactionRepository.debitAccount(sourceAccount.getAccountId(), transAmount);

        if(affectedAccounts == 0){
            throw new InsufficientBalanceException("Your account's balance is insufficient for this transaction.");
        }

        transactionRepository.creditAccount(receivingAccount.getAccountId(), transAmount);

        transactionRepository.insertNewTransactionLog(
                sourceAccount.getAccountId(),
                "debit",
                transAmount,
                receivingAccount.getAccountId(),
                "Transfer from " + sourceAccount.getAccountType() + " account " + sourceAccount.getAccountNumber() + " to " + receivingAccount.getAccountType() + " account " + receivingAccount.getAccountNumber(),
                transactionDescription,
                "Completed"
                );

        transactionRepository.insertNewTransactionLog(
                receivingAccount.getAccountId(),
                "credit",
                transAmount,
                null,
                "Transfer received from " + sourceAccount.getAccountType() + " account " + sourceAccount.getAccountNumber(),
                transactionDescription,
                "Completed"
        );
    }
}

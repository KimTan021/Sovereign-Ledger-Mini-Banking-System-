package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.response.AccountResponseDTO;
import com.sovereign_ledger.dto.response.TransactionResponseDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.entity.Transaction;
import com.sovereign_ledger.exception.exception_classes.AccountNotFoundException;
import com.sovereign_ledger.exception.exception_classes.AccountNotVerifiedException;
import com.sovereign_ledger.exception.exception_classes.InsufficientBalanceException;
import com.sovereign_ledger.repository.AccountRepository;
import com.sovereign_ledger.repository.TransactionRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.TransactionService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionServiceImplementation implements TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountServiceImplementation accountServiceImplementation;

    private TransactionResponseDTO toTransactionResponseDTO(Transaction transaction){
        return new TransactionResponseDTO(
                transaction.getTransactionId(),
                transaction.getAccount().getAccountId(),
                transaction.getTransactionType(),
                transaction.getTransactionAmount(),
                transaction.getAccountIdDestination(),
                transaction.getLogs(),
                transaction.getTransactionTime(),
                transaction.getTransactionDescription(),
                transaction.getTransactionStatus()
        );
    }

    public TransactionServiceImplementation(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            UserRepository userRepository,
            AccountServiceImplementation accountServiceImplementation){
        this.transactionRepository=transactionRepository;
        this.accountRepository=accountRepository;
        this.userRepository=userRepository;
        this.accountServiceImplementation=accountServiceImplementation;
    }

    public List<TransactionResponseDTO> findAllTransactions(){
        return transactionRepository.findAll()
                .stream()
                .map(t -> toTransactionResponseDTO(t))
                .toList();
    }

    public TransactionResponseDTO findTransactionById(Integer id){
        Transaction transaction = transactionRepository.findById(id).orElse(null);
        return toTransactionResponseDTO(transaction);
    }

    public List<TransactionResponseDTO> findAllUserTransactions(Integer id){
        return transactionRepository.findAllUserTransactions(id)
                .stream()
                .map(t -> toTransactionResponseDTO(t))
                .toList();
    } //Q1

    public Integer findTransactionVolumeToday(){
        return transactionRepository.findTransactionVolumeToday();
    } //Q2

    public List<TransactionResponseDTO> findAllTransactionsLastMonthById(Integer id){
        return transactionRepository.findAllTransactionsLastMonthById(id)
                .stream()
                .map(t -> toTransactionResponseDTO(t))
                .toList();
    } //Q3

    public BigDecimal findSumAllTransactionsLastMonthById(Integer id){
        return transactionRepository.findSumAllTransactionsLastMonthById(id);
    } //Q4

    public TransactionResponseDTO saveTransaction(Transaction transaction){
        return toTransactionResponseDTO(transactionRepository.save(transaction));
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

    public void insertNewTransactionLogWithDate(Integer sourceAccountId,
                                                String transactionType,
                                                BigDecimal transactionAmount,
                                                Integer targetAccountId,
                                                String logs,
                                                LocalDateTime transactionTime,
                                                String transactionDescription,
                                                String transactionStatus) {
        transactionRepository.insertNewTransactionLogWithDate(
                sourceAccountId,
                transactionType,
                transactionAmount,
                targetAccountId,
                logs,
                transactionTime,
                transactionDescription,
                transactionStatus
        );
    } //Q8

    public void deleteTransaction(Integer id){
        transactionRepository.deleteById(id);
    }

    //Note: For this, the source Account will always be an account that the user has access to. There should be no reason to throw an error for not having an existing source account
    @Transactional
    public void initiateTransaction(
            Account sourceAccount,
            Account receivingAccount,
            BigDecimal transAmount,
            String logs,
            String transactionDescription
            ) {
        if (accountServiceImplementation.findAccountEntityById(receivingAccount.getAccountId())==null) {
            throw new AccountNotFoundException("The account you are trying to send money to does not exist.");
        }

        if ((!sourceAccount.getAccountStatus().equals("Verified")) || (!receivingAccount.getAccountStatus().equals("Verified"))){
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

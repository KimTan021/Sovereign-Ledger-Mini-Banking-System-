package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.request.TransferRequestDTO;
import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Transaction;
import com.sovereign_ledger.service.AccountService;
import com.sovereign_ledger.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {
    private final TransactionService transactionService;
    private final AccountService accountService;

    public TransactionController(TransactionService transactionService, AccountService accountService){
        this.transactionService = transactionService;
        this.accountService = accountService;
    }

    @GetMapping
    public List<Transaction> findAllTransactions(){
        return transactionService.findAllTransactions();
    }

    @GetMapping("/{id}")
    public Transaction findTransactionById(@PathVariable Integer id){
        return transactionService.findTransactionById(id);
    }

    @GetMapping("/{userId}/transactions")
    public List<Transaction> findAllUserTransactions(@PathVariable Integer userId){
        return transactionService.findAllUserTransactions(userId);
    }

    @GetMapping("/total-volume-today")
    public Integer findTransactionVolumeToday(){
        return transactionService.findTransactionVolumeToday();
    }

    @GetMapping("/{userId}/all-transactions-last-month")
    public List<Transaction> findAllTransactionsLastMonthById(@PathVariable Integer userId){
        return transactionService.findAllTransactionsLastMonthById(userId);
    }

    @GetMapping("/{userId}/all-transactions-last-month-sum")
    public BigDecimal findSumAllTransactionsLastMonthById(Integer userId){
        return transactionService.findSumAllTransactionsLastMonthById(userId);
    }

    @PutMapping
    public Transaction saveTransaction(@RequestBody Transaction transaction){
        return transactionService.saveTransaction(transaction);
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Integer id){
        transactionService.deleteTransaction(id);
    }

    @PostMapping("/{id}/new-transaction-log")
    public void insertNewTransactionLog(@PathVariable Integer sourceAccountId,
                                        String transactionType,
                                        BigDecimal transactionAmount,
                                        Integer targetAccountId,
                                        String logs,
                                        String transactionDescription,
                                        String transactionStatus){
        transactionService.insertNewTransactionLog(
                sourceAccountId,
                transactionType,
                transactionAmount,
                targetAccountId,
                logs,
                transactionDescription,
                transactionStatus
        );
    }

    @PutMapping("/transfer-transaction")
    public ResponseEntity<String> initiateTransaction(@RequestBody TransferRequestDTO request){
        transactionService.initiateTransaction(
                accountService.findAccountById(request.getSourceAccountId()),
                accountService.findAccountById(request.getReceivingAccountId()),
                request.getTransAmount(),
                request.getLogs(),
                request.getTransactionDescription()
        );
        return ResponseEntity.ok("Transaction successful!");
    }
}

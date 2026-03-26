package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Transaction;
import com.sovereign_ledger.service.TransactionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transaction")
public class TransactionController {
    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService){
        this.transactionService = transactionService;
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

    @PutMapping
    public Transaction saveTransaction(@RequestBody Transaction transaction){
        return transactionService.saveTransaction(transaction);
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Integer id){
        transactionService.deleteTransaction(id);
    }
}

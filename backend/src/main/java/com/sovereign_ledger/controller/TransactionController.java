package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.request.TransactionLogRequestDTO;
import com.sovereign_ledger.dto.request.TransferRequestDTO;
import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.dto.response.TransactionResponseDTO;
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
    public ResponseEntity<List<TransactionResponseDTO>> findAllTransactions(){
        return ResponseEntity.ok(transactionService.findAllTransactions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponseDTO> findTransactionById(@PathVariable Integer id){
        return ResponseEntity.ok(transactionService.findTransactionById(id));
    }

    @GetMapping("/{userId}/transactions")
    public ResponseEntity<List<TransactionResponseDTO>> findAllUserTransactions(@PathVariable Integer userId){
        return ResponseEntity.ok(transactionService.findAllUserTransactions(userId));
    }

    @GetMapping("/total-volume-today")
    public ResponseEntity<Integer> findTransactionVolumeToday(){
        return ResponseEntity.ok(transactionService.findTransactionVolumeToday());
    }

    @GetMapping("/{userId}/all-transactions-last-month")
    public ResponseEntity<List<TransactionResponseDTO>> findAllTransactionsLastMonthById(@PathVariable Integer userId){
        return ResponseEntity.ok(transactionService.findAllTransactionsLastMonthById(userId));
    }

    @GetMapping("/{userId}/all-transactions-last-month-sum")
    public ResponseEntity<BigDecimal> findSumAllTransactionsLastMonthById(@PathVariable Integer userId){
        return ResponseEntity.ok(transactionService.findSumAllTransactionsLastMonthById(userId));
    }

    @PutMapping
    public ResponseEntity<TransactionResponseDTO> saveTransaction(@RequestBody Transaction transaction){
        return ResponseEntity.ok(transactionService.saveTransaction(transaction));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Integer id){
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/new-transaction-log")
    public void insertNewTransactionLog(@RequestBody TransactionLogRequestDTO dto){
        if (dto.getTransactionTime() != null) {
            transactionService.insertNewTransactionLogWithDate(
                    dto.getSourceAccountId(),
                    dto.getTransactionType(),
                    dto.getTransactionAmount(),
                    dto.getTargetAccountId(),
                    dto.getLogs(),
                    dto.getTransactionTime(),
                    dto.getTransactionDescription(),
                    dto.getTransactionStatus()
            );
        } else {
            transactionService.insertNewTransactionLog(
                    dto.getSourceAccountId(),
                    dto.getTransactionType(),
                    dto.getTransactionAmount(),
                    dto.getTargetAccountId(),
                    dto.getLogs(),
                    dto.getTransactionDescription(),
                    dto.getTransactionStatus()
            );
        }
    }

    @PutMapping("/transfer-transaction")
    public ResponseEntity<String> initiateTransaction(@RequestBody TransferRequestDTO request){
        transactionService.initiateTransaction(
                accountService.findAccountEntityById(request.getSourceAccountId()),
                accountService.findAccountEntityById(request.getReceivingAccountId()),
                request.getTransAmount(),
                request.getLogs(),
                request.getTransactionDescription()
        );
        return ResponseEntity.ok("Transaction successful!");
    }
}

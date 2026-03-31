package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.request.*;
import com.sovereign_ledger.dto.response.OTPResponseDTO;
import com.sovereign_ledger.dto.response.TransactionResponseDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.entity.Transaction;
import com.sovereign_ledger.service.AccountService;
import com.sovereign_ledger.service.TransactionService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transactions")
public class TransactionController {
    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);
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
                    dto.getTransactionStatus(),
                    dto.getTargetAccountNumber(),
                    dto.getTargetAccountName()
            );
        } else {
            transactionService.insertNewTransactionLog(
                    dto.getSourceAccountId(),
                    dto.getTransactionType(),
                    dto.getTransactionAmount(),
                    dto.getTargetAccountId(),
                    dto.getLogs(),
                    dto.getTransactionDescription(),
                    dto.getTransactionStatus(),
                    dto.getTargetAccountNumber(),
                    dto.getTargetAccountName()
            );
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<OTPResponseDTO> initiateTransactionByAccountNumber(@Valid @RequestBody TransferByAccountNumberRequestDTO request){
        logger.info("====== TRANSFER INITIATED ======");
        logger.info("Source Account ID in request: {}", request.getSourceAccountId());
        logger.info("Target Account Number: {}", request.getTargetAccountNumber());
        logger.info("Amount: {}", request.getTransAmount());

        String userEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        return ResponseEntity.ok(transactionService.initiateTransaction(
                accountService.findAccountEntityById(request.getSourceAccountId()),
                accountService.findAccountEntityByAccountNumberRaw(request.getTargetAccountNumber()),
                request.getTransAmount(),
                "Transfer to Account # " + request.getTargetAccountNumber(),
                request.getDescription(),
                userEmail
        ));
    }

    @PostMapping("/verify-transfer-otp")
    public ResponseEntity<OTPResponseDTO> verifyTransferOtp(
            @Valid @RequestBody OTPVerifyRequestDTO request) {
        return ResponseEntity.ok(transactionService.verifyTransferOtp(
                request.getEmail(),
                request.getOtpCode()
        ));
    }

    @PostMapping("/resend-transfer-otp")
    public ResponseEntity<OTPResponseDTO> resendTransferOtp(
            @Valid @RequestBody OTPResendRequestDTO request) {
        return ResponseEntity.ok(transactionService.resendTransferOtp(request.getEmail()));
    }

    @PostMapping("/cancel-transfer-otp")
    public ResponseEntity<Map<String, String>> cancelTransferOtp(
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, String> response = transactionService.cancelTransferOtp(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/deposit")
    public ResponseEntity<String> depositToAccount(@Valid @RequestBody CashTransactionRequestDTO request) {
        transactionService.depositToAccount(
                request.getAccountId(),
                request.getTransAmount(),
                request.getDescription()
        );
        return ResponseEntity.ok("Deposit posted successfully.");
    }

    @PostMapping("/withdraw")
    public ResponseEntity<String> withdrawFromAccount(@Valid @RequestBody CashTransactionRequestDTO request) {
        transactionService.withdrawFromAccount(
                request.getAccountId(),
                request.getTransAmount(),
                request.getDescription()
        );
        return ResponseEntity.ok("Withdrawal posted successfully.");
    }
}

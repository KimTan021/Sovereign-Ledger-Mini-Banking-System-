package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.request.*;
import com.sovereign_ledger.dto.response.OTPResponseDTO;
import com.sovereign_ledger.dto.response.TransactionResponseDTO;
import com.sovereign_ledger.entity.Transaction;
import com.sovereign_ledger.service.AccountService;
import com.sovereign_ledger.service.TransactionService;
import jakarta.validation.Valid;
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
    public ResponseEntity<OTPResponseDTO> initiateExternalTransfer(@Valid @RequestBody TransferByAccountNumberRequestDTO request){
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(transactionService.initiateTransaction(
                accountService.findAccountEntityById(request.getSourceAccountId()),
                accountService.findAccountEntityByAccountNumberRaw(request.getTargetAccountNumber()),
                request.getTransAmount(),
                "Transfer to Account # " + request.getTargetAccountNumber(),
                request.getDescription(),
                userEmail
        ));
    }

    @PostMapping("/transfer-internal/initiate")
    public ResponseEntity<TransactionResponseDTO> initiateInternalTransfer(@Valid @RequestBody TransferRequestDTO request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(transactionService.initiateInternalTransfer(
                request.getSourceAccountId(),
                request.getReceivingAccountId(),
                request.getTransAmount(),
                request.getLogs(),
                request.getTransactionDescription(),
                userEmail
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<OTPResponseDTO> verifyTransactionOtp(
            @Valid @RequestBody OTPVerifyRequestDTO request) {
        return ResponseEntity.ok(transactionService.verifyTransactionOtp(
                request.getEmail(),
                request.getOtpCode()
        ));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<OTPResponseDTO> resendTransactionOtp(
            @Valid @RequestBody OTPResendRequestDTO request) {
        return ResponseEntity.ok(transactionService.resendTransactionOtp(request.getEmail()));
    }

    @PostMapping("/cancel-otp")
    public ResponseEntity<Map<String, String>> cancelTransactionOtp(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transactionService.cancelTransactionOtp(userDetails.getUsername()));
    }

    @PostMapping("/deposit/initiate")
    public ResponseEntity<TransactionResponseDTO> initiateDeposit(@Valid @RequestBody CashTransactionRequestDTO request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(transactionService.initiateDeposit(
                request.getAccountId(),
                request.getTransAmount(),
                request.getDescription(),
                userEmail
        ));
    }

    @PostMapping("/withdraw/initiate")
    public ResponseEntity<TransactionResponseDTO> initiateWithdrawal(@Valid @RequestBody CashTransactionRequestDTO request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(transactionService.initiateWithdrawal(
                request.getAccountId(),
                request.getTransAmount(),
                request.getDescription(),
                userEmail
        ));
    }

    // Keep legacy verify/resend/cancel for a short transition period but point to new methods
    @PostMapping("/verify-transfer-otp")
    @Deprecated
    public ResponseEntity<OTPResponseDTO> verifyTransferOtp(@Valid @RequestBody OTPVerifyRequestDTO request) {
        return verifyTransactionOtp(request);
    }

    @PostMapping("/resend-transfer-otp")
    @Deprecated
    public ResponseEntity<OTPResponseDTO> resendTransferOtp(@Valid @RequestBody OTPResendRequestDTO request) {
        return resendTransactionOtp(request);
    }

    @PostMapping("/cancel-transfer-otp")
    @Deprecated
    public ResponseEntity<Map<String, String>> cancelTransferOtp(@AuthenticationPrincipal UserDetails userDetails) {
        return cancelTransactionOtp(userDetails);
    }
}

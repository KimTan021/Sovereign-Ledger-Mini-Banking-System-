package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.response.AccountResponseDTO;
import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.service.AccountService;
import com.sovereign_ledger.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/accounts")
public class AccountController {
    private final AccountService accountService;

    public AccountController(AccountService accountService){
        this.accountService=accountService;
    }

    @GetMapping
    public ResponseEntity<List<AccountResponseDTO>> findAllAccounts(){
        return ResponseEntity.ok(accountService.findAllAccounts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponseDTO> findAccountById(@PathVariable Integer id){
        return ResponseEntity.ok(accountService.findAccountById(id));
    }

    @GetMapping("/{id}/accounts")
    public ResponseEntity<List<AccountResponseDTO>> findAllAccountsById(@PathVariable Integer id){
        return ResponseEntity.ok(accountService.findAllAccountsByUserId(id));
    }

    @GetMapping("/{userId}/accounts/total-balance")
    public ResponseEntity<BigDecimal> findTotalAccountBalanceByUserId(@PathVariable Integer userId){
        return ResponseEntity.ok(accountService.findTotalAccountBalanceByUserId(userId));
    }

    @GetMapping("/{userId}/accounts/{accountId}/balance") //tested-works
    public ResponseEntity<BigDecimal> findAccountBalanceByUserIdAndAccountId(@PathVariable Integer userId,@PathVariable Integer accountId){
        return ResponseEntity.ok(accountService.findAccountBalanceByUserIdAndAccountId(userId, accountId));
    }

    @GetMapping("/total-user-accounts") //tested-works
    public ResponseEntity<Integer> findTotalUserAccounts(){
        return ResponseEntity.ok(accountService.findTotalUserAccounts());
    }

    @GetMapping("/total-liquidity") //tested - works
    public ResponseEntity<BigDecimal> findTotalLiquidity(){
        return ResponseEntity.ok(accountService.findTotalLiquidity());
    }

    @GetMapping("/most-valuable-accounts")  // tested - works
    public ResponseEntity<List<TopAccountDTO>> findTop3MostValuableAccounts(){
        return ResponseEntity.ok(accountService.findTop3MostValuableAccounts());
    }

    @PutMapping
    public ResponseEntity<AccountResponseDTO> saveAccount(@RequestBody Account account){
        return ResponseEntity.ok(accountService.saveAccount(account));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Integer id){

        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}

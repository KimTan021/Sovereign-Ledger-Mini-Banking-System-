package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.service.AccountService;
import com.sovereign_ledger.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/account")
public class AccountController {
    private final AccountService accountService;

    public AccountController(AccountService accountService){
        this.accountService=accountService;
    }

    @GetMapping
    public List<Account> findAllAccounts(){
        return accountService.findAllAccounts();
    }

    @GetMapping("/{id}")
    public Account findAccountById(@PathVariable Integer id){
        return accountService.findAccountById(id);
    }

    @GetMapping("/{id}/accounts")
    public List<Account> findAllAccountsById(@PathVariable Integer id){
        return accountService.findAllAccountsByUserId(id);
    }

    @GetMapping("/{id}/accounts/total-balance")
    public BigDecimal findTotalAccountBalanceByUserId(@PathVariable Integer id){
        return accountService.findTotalAccountBalanceByUserId(id);
    }

    @GetMapping("/{userId}/accounts/{accountId}/balance")
    public BigDecimal findAccountBalanceByUserIdAndAccountId(@PathVariable Integer userId,@PathVariable Integer accountId){
        return accountService.findAccountBalanceByUserIdAndAccountId(userId, accountId);
    }

    @GetMapping("/total-user-accounts")
    public Integer findTotalUserAccounts(){
        return accountService.findTotalUserAccounts();
    }

    @GetMapping("/total-liquidity")
    public BigDecimal findTotalLiquidity(){
        return accountService.findTotalLiquidity();
    }

    @GetMapping("/most-valuable-accounts")
    public List<TopAccountDTO> findTop3MostValuableAccounts(){
        return accountService.findTop3MostValuableAccounts();
    }

    @PutMapping
    public Account saveAccount(@RequestBody Account account){
        return accountService.saveAccount(account);
    }

    @DeleteMapping("/{id}")
    public void deleteAccount(@PathVariable Integer id){
        accountService.deleteAccount(id);
    }
}

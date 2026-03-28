package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.response.AccountResponseDTO;
import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.service.AccountService;
import com.sovereign_ledger.service.UserService;
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
    public List<AccountResponseDTO> findAllAccounts(){
        return accountService.findAllAccounts();
    }

    @GetMapping("/{id}")
    public AccountResponseDTO findAccountById(@PathVariable Integer id){
        return accountService.findAccountById(id);
    }

    @GetMapping("/{id}/accounts")
    public List<AccountResponseDTO> findAllAccountsById(@PathVariable Integer id){
        return accountService.findAllAccountsByUserId(id);
    }

    @GetMapping("/{userId}/accounts/total-balance")
    public BigDecimal findTotalAccountBalanceByUserId(@PathVariable Integer userId){
        return accountService.findTotalAccountBalanceByUserId(userId);
    }

    @GetMapping("/{userId}/accounts/{accountId}/balance") //tested-works
    public BigDecimal findAccountBalanceByUserIdAndAccountId(@PathVariable Integer userId,@PathVariable Integer accountId){
        return accountService.findAccountBalanceByUserIdAndAccountId(userId, accountId);
    }

    @GetMapping("/total-user-accounts") //tested-works
    public Integer findTotalUserAccounts(){
        return accountService.findTotalUserAccounts();
    }

    @GetMapping("/total-liquidity") //tested - works
    public BigDecimal findTotalLiquidity(){
        return accountService.findTotalLiquidity();
    }

    @GetMapping("/most-valuable-accounts")  // tested - works
    public List<TopAccountDTO> findTop3MostValuableAccounts(){
        return accountService.findTop3MostValuableAccounts();
    }

    @PutMapping
    public AccountResponseDTO saveAccount(@RequestBody Account account){
        return accountService.saveAccount(account);
    }

    @DeleteMapping("/{id}")
    public void deleteAccount(@PathVariable Integer id){
        accountService.deleteAccount(id);
    }
}

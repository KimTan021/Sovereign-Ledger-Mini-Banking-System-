package com.sovereign_ledger.controller;

import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.service.AccountService;
import com.sovereign_ledger.service.UserService;
import org.springframework.web.bind.annotation.*;

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

    @PutMapping
    public Account saveAccount(@RequestBody Account account){
        return accountService.saveAccount(account);
    }

    @DeleteMapping("/{id}")
    public void deleteAccount(@PathVariable Integer id){
        accountService.deleteAccount(id);
    }
}

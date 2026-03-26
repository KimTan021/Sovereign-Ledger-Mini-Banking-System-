package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.repository.AccountRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.AccountService;
import com.sovereign_ledger.service.UserService;
import jakarta.persistence.criteria.CriteriaBuilder;

import java.math.BigDecimal;
import java.util.List;

public class AccountServiceImplementation implements AccountService {
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountServiceImplementation(
            AccountRepository accountRepository,
            UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    public List<Account> findAllAccounts(){
        return accountRepository.findAll();
    }

    public Account findAccountById(Integer id){
        return accountRepository.findById(id).orElse(null);
    }

    public List<Account> findAllAccountsByUserId(Integer id){
        return accountRepository.findAllAccountsByUserId(id);
    } //Q1

    public BigDecimal findTotalAccountBalanceByUserId(Integer id){
        return accountRepository.findTotalAccountBalanceByUserId(id);
    } //Q2

    public BigDecimal findAccountBalanceByUserIdAndAccountId(Integer uid, Integer aid){
        return accountRepository.findAccountBalanceByUserIdAndAccountId(uid, aid);
    } //Q3

    public Integer findTotalUserAccounts(){
        return accountRepository.findTotalUserAccounts();
    } //Q4

    public BigDecimal findTotalLiquidity(){
        return accountRepository.findTotalLiquidity();
    } //Q5

    public List<TopAccountDTO> findTop3MostValuableAccounts(){
        return accountRepository.findTop3MostValuableAccounts();
    } //Q6

    public Account saveAccount(Account account){
        return accountRepository.save(account);
    }

    public void deleteAccount(Integer id){
        accountRepository.deleteById(id);
    }
}

package com.sovereign_ledger.service;

import com.sovereign_ledger.entity.Account;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AccountService {
    List<Account> findAllAccounts();
    Account findAccountById(Integer id);
    Account saveAccount(Account account);
    void deleteAccount(Integer id);
}

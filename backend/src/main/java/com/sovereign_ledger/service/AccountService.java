package com.sovereign_ledger.service;

import com.sovereign_ledger.entity.Account;
import java.util.List;

public interface AccountService {
    List<Account> findAllAccounts();
    Account findAccountById(Integer id);
    Account saveAccount(Account account);
    void deleteAccount(Integer id);
}

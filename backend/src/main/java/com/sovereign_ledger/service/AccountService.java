package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Account;

import java.math.BigDecimal;
import java.util.List;

public interface AccountService {
    List<Account> findAllAccounts();
    Account findAccountById(Integer id);
    List<Account> findAllAccountsByUserId(Integer id);
    BigDecimal findTotalAccountBalanceByUserId(Integer id);
    BigDecimal findAccountBalanceByUserIdAndAccountId(Integer uid, Integer aid);
    Integer findTotalUserAccounts();
    BigDecimal findTotalLiquidity();
    List<TopAccountDTO> findTop3MostValuableAccounts();
    Account saveAccount(Account account);
    void deleteAccount(Integer id);
}

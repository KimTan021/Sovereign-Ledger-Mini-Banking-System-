package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.response.AccountResponseDTO;
import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Account;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public interface AccountService {
    List<AccountResponseDTO> findAllAccounts();
    AccountResponseDTO findAccountById(Integer id);
    Account findAccountEntityById(Integer id);
    Account findAccountEntityByAccountNumberRaw(String rawAccountNumber);
    List<AccountResponseDTO> findAllAccountsByUserId(Integer id);
    BigDecimal findTotalAccountBalanceByUserId(Integer id);
    BigDecimal findAccountBalanceByUserIdAndAccountId(Integer uid, Integer aid);
    Integer findTotalUserAccounts();
    BigDecimal findTotalLiquidity();
    List<TopAccountDTO> findTop3MostValuableAccounts();

    AccountResponseDTO saveAccount(Account account);

    void deleteAccount(Integer id);
}

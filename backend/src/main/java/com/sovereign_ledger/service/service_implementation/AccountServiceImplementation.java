package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.response.AccountResponseDTO;
import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.exception.exception_classes.AccountNotFoundException;
import com.sovereign_ledger.repository.AccountRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.AccountService;
import com.sovereign_ledger.service.UserService;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AccountServiceImplementation implements AccountService {
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountServiceImplementation(
            AccountRepository accountRepository,
            UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    private AccountResponseDTO toAccountResponseDTO(Account account){
        return new AccountResponseDTO(
                account.getAccountId(),
                account.getUser().getUserId(),
                account.getAccountNumber(),
                account.getAccountType(),
                account.getAccountBalance(),
                account.getAccountStatus()
                );
    }

    public List<AccountResponseDTO> findAllAccounts(){
        return accountRepository.findAll()
                .stream()
                .map(a -> toAccountResponseDTO(a))
                .toList();
    }

    public AccountResponseDTO findAccountById(Integer id){
        Account account = accountRepository.findById(id).orElseThrow(() -> new AccountNotFoundException("No account found at id: " + id));
        return toAccountResponseDTO(account);
    }

    public Account findAccountEntityById(Integer id){
        return accountRepository.findById(id).orElseThrow(() -> new AccountNotFoundException("No account found at id: " + id));
    }

    public List<AccountResponseDTO> findAllAccountsByUserId(Integer id){
        List<AccountResponseDTO> account = accountRepository.findAllAccountsByUserId(id)
                .stream()
                .map(a -> toAccountResponseDTO(a))
                .toList();
        return account;
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

    public AccountResponseDTO saveAccount(Account account){
        return toAccountResponseDTO(accountRepository.save(account));
    }

    public void deleteAccount(Integer id){
        accountRepository.deleteById(id);
    }
}

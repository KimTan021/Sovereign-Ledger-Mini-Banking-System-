package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.repository.AccountRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.AccountService;
import com.sovereign_ledger.service.UserService;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.stereotype.Service;

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

    public List<Account> findAllAccounts(){
        return accountRepository.findAll();
    }

    public Account findAccountById(Integer id){
        return accountRepository.findById(id).orElse(null);
    }

    public Account saveAccount(Account account){
        return accountRepository.save(account);
    }

    public void deleteAccount(Integer id){
        accountRepository.deleteById(id);
    }
}

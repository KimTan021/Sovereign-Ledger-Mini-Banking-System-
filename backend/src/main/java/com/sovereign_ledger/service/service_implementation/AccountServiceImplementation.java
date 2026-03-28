package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.response.AccountResponseDTO;
import com.sovereign_ledger.dto.response.TopAccountDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.exception.exception_classes.AccountNotFoundException;
import com.sovereign_ledger.repository.AccountRepository;
import com.sovereign_ledger.service.AccountService;
import com.sovereign_ledger.util.AesEncryptionUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AccountServiceImplementation implements AccountService {
    private final AccountRepository accountRepository;

    @Value("${aes.secret-key}")
    private String aesSecretKey;

    public AccountServiceImplementation(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    private AccountResponseDTO toAccountResponseDTO(Account account){
        String accNum = account.getAccountNumber();
        try {
            accNum = AesEncryptionUtil.decrypt(accNum, aesSecretKey);
        } catch (Exception e) {
            // Decryption failed.
        }
        return new AccountResponseDTO(
                account.getAccountId(),
                account.getUser().getUserId(),
                accNum,
                account.getAccountType(),
                account.getAccountBalance(),
                account.getAccountStatus()
                );
    }

    @Override
    public List<AccountResponseDTO> findAllAccounts(){
        return accountRepository.findAll()
                .stream()
                .map(a -> toAccountResponseDTO(a))
                .toList();
    }

    @Override
    public AccountResponseDTO findAccountById(Integer id){
        Account account = accountRepository.findById(id).orElseThrow(() -> new AccountNotFoundException("No account found at id: " + id));
        return toAccountResponseDTO(account);
    }

    @Override
    public Account findAccountEntityById(Integer id){
        return accountRepository.findById(id).orElseThrow(() -> new AccountNotFoundException("No account found at id: " + id));
    }

    @Override
    public Account findAccountEntityByAccountNumberRaw(String rawAccountNumber) {
        if (rawAccountNumber == null || rawAccountNumber.isBlank()) {
            throw new AccountNotFoundException("Account number cannot be empty.");
        }
        
        String cleanAccountNumber = normalizeAccountNumber(rawAccountNumber);
        List<Account> allAccounts = accountRepository.findAll();
        
        for (Account account : allAccounts) {
            String dbAccountNumber = account.getAccountNumber();
            if (dbAccountNumber == null) continue;

            // 1. Try Decryption match
            try {
                String decrypted = AesEncryptionUtil.decrypt(dbAccountNumber, aesSecretKey);
                if (normalizeAccountNumber(decrypted).equals(cleanAccountNumber)) {
                    return account;
                }
            } catch (Exception e) {
                // Decryption failed - likely legacy or raw data, fall through to raw check
            }
            
            // 2. Try Raw match (fallback for seeded accounts or migration data)
            if (normalizeAccountNumber(dbAccountNumber).equals(cleanAccountNumber)) {
                return account;
            }
        }
        throw new AccountNotFoundException("No active account found with Account Number: " + cleanAccountNumber);
    }

    private String normalizeAccountNumber(String accountNumber) {
        return accountNumber.replaceAll("[^A-Za-z0-9]", "");
    }

    @Override
    public List<AccountResponseDTO> findAllAccountsByUserId(Integer id){
        List<AccountResponseDTO> account = accountRepository.findAllAccountsByUserId(id)
                .stream()
                .map(a -> toAccountResponseDTO(a))
                .toList();
        return account;
    } //Q1

    @Override
    public BigDecimal findTotalAccountBalanceByUserId(Integer id){
        return accountRepository.findTotalAccountBalanceByUserId(id);
    } //Q2

    @Override
    public BigDecimal findAccountBalanceByUserIdAndAccountId(Integer uid, Integer aid){
        return accountRepository.findAccountBalanceByUserIdAndAccountId(uid, aid);
    } //Q3

    @Override
    public Integer findTotalUserAccounts(){
        return accountRepository.findTotalUserAccounts();
    } //Q4

    @Override
    public BigDecimal findTotalLiquidity(){
        return accountRepository.findTotalLiquidity();
    } //Q5

    @Override
    public List<TopAccountDTO> findTop3MostValuableAccounts(){
        return accountRepository.findTop3MostValuableAccounts();
    } //Q6

    @Override
    public AccountResponseDTO saveAccount(Account account){
        return toAccountResponseDTO(accountRepository.save(account));
    }

    @Override
    public void deleteAccount(Integer id){
        accountRepository.deleteById(id);
    }
}

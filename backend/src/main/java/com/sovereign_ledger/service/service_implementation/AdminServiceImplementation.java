package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.response.UserApprovalResponseDTO;
import com.sovereign_ledger.dto.response.PendingUserResponseDTO;
import com.sovereign_ledger.dto.response.UserResponseDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.entity.PendingUser;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.repository.AccountRepository;
import com.sovereign_ledger.repository.PendingUserRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.AdminService;
import com.sovereign_ledger.util.AesEncryptionUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImplementation implements AdminService {

    private final UserRepository userRepository;
    private final PendingUserRepository pendingUserRepository;
    private final AccountRepository accountRepository;

    @Value("${aes.secret-key}")
    private String aesSecretKey;

    public AdminServiceImplementation(UserRepository userRepository,
                                      PendingUserRepository pendingUserRepository,
                                      AccountRepository accountRepository) {
        this.userRepository = userRepository;
        this.pendingUserRepository = pendingUserRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    public List<UserResponseDTO> findAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> {
                    UserResponseDTO response = new UserResponseDTO();
                    response.setUserId(user.getUserId());
                    response.setFirstName(user.getFirstName());
                    response.setMiddleName(user.getMiddleName());
                    response.setLastName(user.getLastName());
                    response.setUserEmail(user.getUserEmail());
                    response.setRole(user.getRole());
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<PendingUserResponseDTO> findAllPendingUsers() {
        return pendingUserRepository.findAll()
                .stream()
                .map(pendingUser -> {
                    PendingUserResponseDTO response = new PendingUserResponseDTO();
                    response.setUserId(pendingUser.getUserId());
                    response.setFirstName(pendingUser.getFirstName());
                    response.setMiddleName(pendingUser.getMiddleName());
                    response.setLastName(pendingUser.getLastName());
                    response.setUserEmail(pendingUser.getUserEmail());
                    response.setRequestAccountType(pendingUser.getRequestAccountType());
                    response.setRequestTime(pendingUser.getRequestTime());
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserApprovalResponseDTO approvePendingUser(Integer id) {
        PendingUser pendingUser = pendingUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pending user not found with id: " + id));

        User user;

        if (pendingUser.getExistingUser() != null) {
            // Existing user requesting additional account — just fetch
            user = pendingUser.getExistingUser();
        } else {
            // New user registration — create a new User
            user = new User();
            user.setFirstName(pendingUser.getFirstName());
            user.setMiddleName(pendingUser.getMiddleName());
            user.setLastName(pendingUser.getLastName());
            user.setUserEmail(pendingUser.getUserEmail());
            user.setPassword(pendingUser.getPassword());
            user.setRole("user");
            userRepository.save(user);
        }

        // Generate and encrypt account number
        String rawAccountNumber = generateAccountNumber();
        String encryptedAccountNumber;
        try {
            encryptedAccountNumber = AesEncryptionUtil.encrypt(rawAccountNumber, aesSecretKey);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt account number", e);
        }

        // Create and save Account linked to the user
        Account account = new Account();
        account.setUser(user);
        account.setAccountNumber(encryptedAccountNumber);
        account.setAccountType(pendingUser.getRequestAccountType());
        account.setAccountBalance(BigDecimal.ZERO);
        account.setAccountStatus("Verified");
        accountRepository.save(account);

        pendingUserRepository.deleteById(id);

        UserApprovalResponseDTO response = new UserApprovalResponseDTO();
        response.setUserId(user.getUserId());
        response.setFirstName(user.getFirstName());
        response.setMiddleName(user.getMiddleName());
        response.setLastName(user.getLastName());
        response.setUserEmail(user.getUserEmail());
        response.setRole(user.getRole());
        response.setAccountType(account.getAccountType());
        response.setAccountStatus(account.getAccountStatus());
        response.setAccountBalance(account.getAccountBalance().toPlainString());
        return response;
    }

    @Override
    @Transactional
    public void rejectPendingUser(Integer id) {
        PendingUser pendingUser = pendingUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pending user not found with id: " + id));
        pendingUserRepository.deleteById(pendingUser.getUserId());
    }

    private String generateAccountNumber() {
        long number = (long) (Math.random() * 9_000_000_000L) + 1_000_000_000L;
        return String.valueOf(number);
    }
}
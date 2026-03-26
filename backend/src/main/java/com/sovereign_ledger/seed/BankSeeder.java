package com.sovereign_ledger.seed;

import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.repository.AccountRepository;
import com.sovereign_ledger.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/seed")
public class BankSeeder {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public BankSeeder(UserRepository userRepository,
                      AccountRepository accountRepository,
                      BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // POST /seed
    @PostMapping
    public ResponseEntity<Map<String, Object>> seed() {
        if (userRepository.count() > 0) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "skipped");
            response.put("message", "Data already exists. Call DELETE /seed to reset first.");
            return ResponseEntity.badRequest().body(response);
        }

        // Customer
        User customerUser = new User();
        customerUser.setFirstName("Juan");
        customerUser.setMiddleName("Santos");
        customerUser.setLastName("Dela Cruz");
        customerUser.setUserEmail("customer@banktest.com");
        customerUser.setPassword(passwordEncoder.encode("Customer1234"));
        customerUser.setRole("USER");
        userRepository.save(customerUser);

        Account customerAccount = new Account();
        customerAccount.setUser(customerUser);
        customerAccount.setAccountNumber("1000000001");
        customerAccount.setAccountType("SAVINGS");
        customerAccount.setAccountBalance(new BigDecimal("10000.00"));
        accountRepository.save(customerAccount);

        // Admin
        User adminUser = new User();
        adminUser.setFirstName("Maria");
        adminUser.setMiddleName("Reyes");
        adminUser.setLastName("Santos");
        adminUser.setUserEmail("admin@banktest.com");
        adminUser.setPassword(passwordEncoder.encode("Admin1234"));
        adminUser.setRole("ADMIN");
        userRepository.save(adminUser);

        Account adminAccount = new Account();
        adminAccount.setUser(adminUser);
        adminAccount.setAccountNumber("1000000002");
        adminAccount.setAccountType("SAVINGS");
        adminAccount.setAccountBalance(new BigDecimal("50000.00"));
        accountRepository.save(adminAccount);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        response.put("message", "Database seeded successfully");
        response.put("customer_email", "customer@banktest.com");
        response.put("customer_password", "Customer1234");
        response.put("admin_email", "admin@banktest.com");
        response.put("admin_password", "Admin1234");
        return ResponseEntity.ok(response);
    }

    // DELETE /seed
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> reset() {
        accountRepository.deleteAll();
        userRepository.deleteAll();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        response.put("message", "All data cleared. Call POST /seed to re-seed.");
        return ResponseEntity.ok(response);
    }
}
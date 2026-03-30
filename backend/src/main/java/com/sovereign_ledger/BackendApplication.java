package com.sovereign_ledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.repository.AccountRepository;
import com.sovereign_ledger.util.AesEncryptionUtil;
import org.springframework.beans.factory.annotation.Value;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@SpringBootApplication
public class BackendApplication {

	@Value("${aes.secret-key}")
	private String aesSecretKey;

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public ApplicationRunner forceResetAdminPassword(
			UserRepository userRepository, 
			AccountRepository accountRepository,
			BCryptPasswordEncoder encoder) {
		return args -> {
			// Ensure Super Admin exists (Alice)
			userRepository.findByUserEmail("alice.santos@email.com").ifPresentOrElse(user -> {
				user.setPassword(encoder.encode("admin123"));
				userRepository.save(user);
				System.out.println("====== SUPER ADMIN PASSWORD RESET TO 'admin123' ======");
			}, () -> {
				com.sovereign_ledger.entity.User admin = new com.sovereign_ledger.entity.User();
				admin.setFirstName("Alice");
				admin.setLastName("Santos");
				admin.setMiddleName("Marie");
				admin.setUserEmail("alice.santos@email.com");
				admin.setPassword(encoder.encode("admin123"));
				admin.setRole("super_admin");
				admin.setUserStatus("ACTIVE");
				admin.setCreatedAt(LocalDateTime.now());
				userRepository.save(admin);
				System.out.println("====== SUPER ADMIN CREATED: alice.santos@email.com / admin123 ======");
			});

			// Ensure a standard Admin exists (Bob)
			userRepository.findByUserEmail("bob.admin@email.com").ifPresentOrElse(user -> {
				user.setPassword(encoder.encode("admin123"));
				userRepository.save(user);
			}, () -> {
				com.sovereign_ledger.entity.User bob = new com.sovereign_ledger.entity.User();
				bob.setFirstName("Bob");
				bob.setLastName("Admin");
				bob.setMiddleName("The");
				bob.setUserEmail("bob.admin@email.com");
				bob.setPassword(encoder.encode("admin123"));
				bob.setRole("admin");
				bob.setUserStatus("ACTIVE");
				bob.setCreatedAt(LocalDateTime.now());
				userRepository.save(bob);
				System.out.println("====== STANDARD ADMIN CREATED: bob.admin@email.com / admin123 ======");
			});

			// Ensure a Test Customer exists for immediate testing
			userRepository.findByUserEmail("juan.delacruz@email.com").ifPresentOrElse(user -> {
				seedAccountIfMissing(user, accountRepository, "Savings", "2002002002");
			}, () -> {
				com.sovereign_ledger.entity.User customer = new com.sovereign_ledger.entity.User();
				customer.setFirstName("Juan");
				customer.setLastName("Dela Cruz");
				customer.setMiddleName("Santos");
				customer.setUserEmail("juan.delacruz@email.com");
				customer.setPassword(encoder.encode("customer123"));
				customer.setRole("user"); // Backend role is 'user', frontend maps to 'customer'
				customer.setUserStatus("ACTIVE");
				customer.setCreatedAt(LocalDateTime.now());
				userRepository.save(customer);
				System.out.println("====== TEST CUSTOMER CREATED: juan.delacruz@email.com / customer123 ======");
				seedAccountIfMissing(customer, accountRepository, "Savings", "2002002002");
			});
		};
	}

	private void seedAccountIfMissing(User user, AccountRepository accountRepository, String type, String rawNumber) {
		if (accountRepository.findAllAccountsByUserId(user.getUserId()).isEmpty()) {
			try {
				Account account = new Account();
				account.setUser(user);
				account.setAccountType(type);
				account.setAccountBalance(new BigDecimal("50000.00"));
				account.setAccountStatus("Verified");
				account.setCreatedAt(LocalDateTime.now());
				String encrypted = AesEncryptionUtil.encrypt(rawNumber, aesSecretKey);
				account.setAccountNumber(encrypted);
				accountRepository.save(account);
				System.out.println("====== SEEDED " + type + " ACCOUNT FOR " + user.getUserEmail() + " ======");
			} catch (Exception e) {
				System.err.println("Failed to seed account for " + user.getUserEmail() + ": " + e.getMessage());
			}
		}
	}
}

package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.request.AdminAdjustmentRequestDTO;
import com.sovereign_ledger.dto.request.AdminUserProfileUpdateRequestDTO;
import com.sovereign_ledger.dto.response.*;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.entity.PendingUser;
import com.sovereign_ledger.entity.Transaction;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.exception.exception_classes.InsufficientBalanceException;
import com.sovereign_ledger.repository.AccountRepository;
import com.sovereign_ledger.repository.PendingUserRepository;
import com.sovereign_ledger.repository.TransactionRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.AdminService;
import com.sovereign_ledger.util.AesEncryptionUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminServiceImplementation implements AdminService {

    private final UserRepository userRepository;
    private final PendingUserRepository pendingUserRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${aes.secret-key}")
    private String aesSecretKey;

    public AdminServiceImplementation(UserRepository userRepository,
                                      PendingUserRepository pendingUserRepository,
                                      AccountRepository accountRepository,
                                      TransactionRepository transactionRepository,
                                      BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.pendingUserRepository = pendingUserRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public PaginatedResponseDTO<UserResponseDTO> findAllUsers(Pageable pageable) {
        Page<User> usersPage = userRepository.findAll(pageable);
        List<UserResponseDTO> content = usersPage.getContent().stream()
                .map(this::toUserResponseDTO)
                .collect(Collectors.toList());
        return toPaginatedResponse(usersPage, content);
    }

    @Override
    public PaginatedResponseDTO<PendingUserResponseDTO> findAllPendingUsers(Pageable pageable) {
        Page<PendingUser> pendingPage = pendingUserRepository.findAll(pageable);
        List<PendingUserResponseDTO> content = pendingPage.getContent().stream()
                .map(PendingUserResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return toPaginatedResponse(pendingPage, content);
    }

    @Override
    @Transactional
    public UserApprovalResponseDTO approvePendingUser(Integer id) {
        PendingUser pendingUser = pendingUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pending user not found with id: " + id));

        User user;

        if (pendingUser.getExistingUser() != null) {
            user = pendingUser.getExistingUser();
        } else {
            user = new User();
            user.setFirstName(pendingUser.getFirstName());
            user.setMiddleName(pendingUser.getMiddleName());
            user.setLastName(pendingUser.getLastName());
            user.setUserEmail(pendingUser.getUserEmail());
            user.setPassword(pendingUser.getPassword());
            user.setRole("user");
            user.setPhone(pendingUser.getPhone());
            user.setUserStatus("ACTIVE");
            userRepository.save(user);
        }

        String rawAccountNumber = generateAccountNumber();
        String encryptedAccountNumber;
        try {
            encryptedAccountNumber = AesEncryptionUtil.encrypt(rawAccountNumber, aesSecretKey);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt account number", e);
        }

        Account account = new Account();
        account.setUser(user);
        account.setAccountNumber(encryptedAccountNumber);
        account.setAccountType(pendingUser.getRequestAccountType());
        account.setAccountBalance(pendingUser.getInitialDeposit() != null ? pendingUser.getInitialDeposit() : BigDecimal.ZERO);
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

    @Override
    public AdminStatsDTO getSystemStats() {
        BigDecimal totalLiquidity = Optional.ofNullable(accountRepository.findTotalLiquidity()).orElse(BigDecimal.ZERO);
        Integer dailyVolume = Optional.ofNullable(transactionRepository.findTransactionVolumeToday()).orElse(0);
        Integer activeEntities = Optional.ofNullable(accountRepository.findTotalUserAccounts()).orElse(0);
        return new AdminStatsDTO(totalLiquidity, dailyVolume, activeEntities);
    }

    @Override
    public List<TopAccountDTO> getHighValueAccounts() {
        return accountRepository.findTop3MostValuableAccounts();
    }

    @Override
    public List<AuditLogDTO> getAuditLogs() {
        return transactionRepository.findTop5ByOrderByTransactionTimeDesc().stream()
                .map(this::mapToAuditLogEntry)
                .collect(Collectors.toList());
    }

    @Override
    public PaginatedResponseDTO<AuditLogDTO> getFullAuditLogs(Pageable pageable) {
        Page<Transaction> auditPage = transactionRepository.findAll(pageable);
        List<AuditLogDTO> content = auditPage.getContent().stream()
                .map(this::mapToAuditLogEntry)
                .collect(Collectors.toList());
        return toPaginatedResponse(auditPage, content);
    }

    @Override
    public List<CategoryMetricDTO> getDailyVolume() {
        return transactionRepository.getDailyTransactionVolumePulsar().stream()
                .map(objs -> new CategoryMetricDTO(String.valueOf(objs[0]), ((Number) objs[1]).doubleValue()))
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryMetricDTO> getTransactionDistribution() {
        return transactionRepository.getTransactionTypeDistribution().stream()
                .map(objs -> new CategoryMetricDTO(String.valueOf(objs[0]), ((Number) objs[1]).doubleValue()))
                .collect(Collectors.toList());
    }

    @Override
    public AdminUserDetailDTO findUserDetail(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        List<Account> accounts = accountRepository.findAllAccountsByUserId(id);
        BigDecimal totalBalance = accounts.stream()
                .map(Account::getAccountBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new AdminUserDetailDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getMiddleName(),
                user.getLastName(),
                user.getUserEmail(),
                user.getPhone(),
                user.getRole(),
                user.getUserStatus(),
                totalBalance,
                accounts.stream().map(this::toAdminAccountDTO).toList()
        );
    }

    @Override
    @Transactional
    public UserResponseDTO updateUserProfile(Integer id, AdminUserProfileUpdateRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setFirstName(request.getFirstName());
        user.setMiddleName(request.getMiddleName());
        user.setLastName(request.getLastName());
        user.setUserEmail(request.getUserEmail());
        user.setPhone(request.getPhone());
        return toUserResponseDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponseDTO updateUserStatus(Integer id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setUserStatus(normalizeUserStatus(status));
        return toUserResponseDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponseDTO updateUserRole(Integer id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setRole(normalizeRole(role));
        return toUserResponseDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public AdminPasswordResetResponseDTO resetUserPassword(Integer id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        String password = (newPassword == null || newPassword.isBlank())
                ? UUID.randomUUID().toString().replace("-", "").substring(0, 12)
                : newPassword;
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
        return new AdminPasswordResetResponseDTO(user.getUserId(), password);
    }

    @Override
    @Transactional
    public AdminAccountDTO updateAccountStatus(Integer accountId, String status) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        account.setAccountStatus(normalizeAccountStatus(status));
        return toAdminAccountDTO(accountRepository.save(account));
    }

    @Override
    @Transactional
    public void postAccountAdjustment(Integer accountId, AdminAdjustmentRequestDTO request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        BigDecimal amount = Optional.ofNullable(request.getAmount()).orElse(BigDecimal.ZERO);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Adjustment amount must be greater than zero.");
        }

        String type = Optional.ofNullable(request.getAdjustmentType()).orElse("credit").toLowerCase();
        String description = Optional.ofNullable(request.getDescription()).orElse("").trim();
        if (description.isBlank()) {
            throw new IllegalArgumentException("Administrative adjustments require a reason.");
        }

        String accountNumber = decryptAccountNumber(account.getAccountNumber());
        if ("debit".equals(type)) {
            int affected = transactionRepository.debitAccount(accountId, amount);
            if (affected == 0) {
                throw new InsufficientBalanceException("Insufficient balance for administrative debit.");
            }
            transactionRepository.insertNewTransactionLog(
                    accountId,
                    "debit",
                    amount,
                    null,
                    "Administrative debit for account " + accountNumber,
                    "Admin adjustment: " + description,
                    "Completed",
                    null,
                    null
            );
            return;
        }

        transactionRepository.creditAccount(accountId, amount);
        transactionRepository.insertNewTransactionLog(
                accountId,
                "credit",
                amount,
                null,
                "Administrative credit for account " + accountNumber,
                "Admin adjustment: " + description,
                "Completed",
                null,
                null
        );
    }

    @Override
    public PaginatedResponseDTO<AuditLogDTO> searchTransactions(String search,
                                                                Integer userId,
                                                                Integer accountId,
                                                                BigDecimal minAmount,
                                                                BigDecimal maxAmount,
                                                                String type,
                                                                String status,
                                                                String dateFrom,
                                                                String dateTo,
                                                                Pageable pageable) {
        LocalDate from = parseDate(dateFrom);
        LocalDate to = parseDate(dateTo);
        String normalizedSearch = search == null ? "" : search.toLowerCase().trim();
        String normalizedType = type == null ? "" : type.toLowerCase().trim();
        String normalizedStatus = status == null ? "" : status.toLowerCase().trim();

        List<AuditLogDTO> filtered = transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "transactionTime")).stream()
                .map(this::mapToAuditLogEntry)
                .filter(entry -> normalizedSearch.isBlank() || matchesSearch(entry, normalizedSearch))
                .filter(entry -> userId == null || userId.equals(entry.getUserId()))
                .filter(entry -> accountId == null || accountId.equals(entry.getAccountId()))
                .filter(entry -> minAmount == null || (entry.getAmount() != null && entry.getAmount().compareTo(minAmount) >= 0))
                .filter(entry -> maxAmount == null || (entry.getAmount() != null && entry.getAmount().compareTo(maxAmount) <= 0))
                .filter(entry -> normalizedType.isBlank() || normalizedType.equals(entry.getType().toLowerCase()))
                .filter(entry -> normalizedStatus.isBlank() || entry.getStatus().toLowerCase().contains(normalizedStatus))
                .filter(entry -> from == null || !entry.getTimestamp().toLocalDate().isBefore(from))
                .filter(entry -> to == null || !entry.getTimestamp().toLocalDate().isAfter(to))
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<AuditLogDTO> content = start >= filtered.size() ? List.of() : filtered.subList(start, end);

        return PaginatedResponseDTO.<AuditLogDTO>builder()
                .content(content)
                .totalElements(filtered.size())
                .totalPages((int) Math.ceil((double) filtered.size() / pageable.getPageSize()))
                .size(pageable.getPageSize())
                .number(pageable.getPageNumber())
                .build();
    }

    @Override
    @Transactional
    public AuditLogDTO reviewTransaction(Integer transactionId, String status, String note) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + transactionId));
        transaction.setTransactionStatus(normalizeTransactionStatus(status));
        transaction.setReviewNote(note);
        return mapToAuditLogEntry(transactionRepository.save(transaction));
    }

    private UserResponseDTO toUserResponseDTO(User user) {
        List<Account> accounts = accountRepository.findAllAccountsByUserId(user.getUserId());
        String accountNumber = accounts.isEmpty() ? null : decryptAccountNumber(accounts.get(0).getAccountNumber());
        return new UserResponseDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getMiddleName(),
                user.getLastName(),
                user.getUserEmail(),
                user.getPhone(),
                user.getRole(),
                user.getUserStatus(),
                accountNumber,
                accounts.size()
        );
    }

    private AdminAccountDTO toAdminAccountDTO(Account account) {
        return new AdminAccountDTO(
                account.getAccountId(),
                decryptAccountNumber(account.getAccountNumber()),
                account.getAccountType(),
                account.getAccountBalance(),
                account.getAccountStatus()
        );
    }

    private <S, T> PaginatedResponseDTO<T> toPaginatedResponse(Page<S> page, List<T> content) {
        return PaginatedResponseDTO.<T>builder()
                .content(content)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .size(page.getSize())
                .number(page.getNumber())
                .build();
    }

    private AuditLogDTO mapToAuditLogEntry(Transaction transaction) {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setTransactionId(transaction.getTransactionId());
        dto.setAccountId(transaction.getAccount().getAccountId());
        dto.setUserId(transaction.getAccount().getUser().getUserId());
        dto.setUserName(transaction.getAccount().getUser().getFirstName() + " " + transaction.getAccount().getUser().getLastName());
        dto.setAccountNumber(decryptAccountNumber(transaction.getAccount().getAccountNumber()));
        dto.setTitle(transaction.getTransactionDescription());
        dto.setDetail(resolveAuditDetail(transaction));
        dto.setAmount(transaction.getTransactionAmount());
        dto.setType(transaction.getTransactionType());
        dto.setStatus(Optional.ofNullable(transaction.getTransactionStatus()).orElse("Completed"));
        dto.setReviewNote(transaction.getReviewNote());
        String txStatus = dto.getStatus().toLowerCase();
        dto.setError(
                "declined".equals(txStatus) ||
                "failed".equals(txStatus) ||
                "review required".equals(txStatus) ||
                "escalated".equals(txStatus)
        );
        dto.setTimestamp(transaction.getTransactionTime());
        return dto;
    }

    private String resolveAuditDetail(Transaction transaction) {
        String detail = transaction.getLogs() != null ? transaction.getLogs() : "Transaction ID: " + transaction.getTransactionId();
        if (detail.contains("account ")) {
            try {
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("account ([A-Za-z0-9+/=]{20,})");
                java.util.regex.Matcher matcher = pattern.matcher(detail);
                StringBuilder sb = new StringBuilder();
                int lastIdx = 0;
                while (matcher.find()) {
                    sb.append(detail, lastIdx, matcher.start(1));
                    sb.append(decryptAccountNumber(matcher.group(1)));
                    lastIdx = matcher.end(1);
                }
                sb.append(detail.substring(lastIdx));
                detail = sb.toString();
            } catch (Exception ignored) {
            }
        }
        return detail;
    }

    private boolean matchesSearch(AuditLogDTO entry, String search) {
        return Optional.ofNullable(entry.getTitle()).orElse("").toLowerCase().contains(search)
                || Optional.ofNullable(entry.getDetail()).orElse("").toLowerCase().contains(search)
                || Optional.ofNullable(entry.getUserName()).orElse("").toLowerCase().contains(search)
                || Optional.ofNullable(entry.getAccountNumber()).orElse("").toLowerCase().contains(search)
                || Optional.ofNullable(entry.getReviewNote()).orElse("").toLowerCase().contains(search);
    }

    private String decryptAccountNumber(String encrypted) {
        if (encrypted == null) {
            return null;
        }
        try {
            return AesEncryptionUtil.decrypt(encrypted, aesSecretKey);
        } catch (Exception e) {
            return encrypted;
        }
    }

    private String normalizeUserStatus(String status) {
        String normalized = Optional.ofNullable(status).orElse("ACTIVE").trim().toUpperCase();
        return switch (normalized) {
            case "ACTIVE", "SUSPENDED" -> normalized;
            default -> throw new IllegalArgumentException("Unsupported user status: " + status);
        };
    }

    private String normalizeRole(String role) {
        String normalized = Optional.ofNullable(role).orElse("user").trim().toLowerCase();
        return switch (normalized) {
            case "user", "admin" -> normalized;
            default -> throw new IllegalArgumentException("Unsupported role: " + role);
        };
    }

    private String normalizeAccountStatus(String status) {
        String normalized = Optional.ofNullable(status).orElse("Verified").trim();
        return switch (normalized.toLowerCase()) {
            case "verified" -> "Verified";
            case "frozen" -> "Frozen";
            case "closed" -> "Closed";
            default -> throw new IllegalArgumentException("Unsupported account status: " + status);
        };
    }

    private String normalizeTransactionStatus(String status) {
        String normalized = Optional.ofNullable(status).orElse("Reviewed").trim();
        return switch (normalized.toLowerCase()) {
            case "reviewed" -> "Reviewed";
            case "escalated" -> "Escalated";
            case "review required" -> "Review Required";
            case "completed" -> "Completed";
            case "failed" -> "Failed";
            default -> throw new IllegalArgumentException("Unsupported review status: " + status);
        };
    }

    private LocalDate parseDate(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return LocalDate.parse(raw);
    }

    private String generateAccountNumber() {
        long number = (long) (Math.random() * 9_000_000_000L) + 1_000_000_000L;
        return String.valueOf(number);
    }
}

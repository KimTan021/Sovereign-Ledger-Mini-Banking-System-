package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.request.AdminAdjustmentRequestDTO;
import com.sovereign_ledger.dto.request.AdminRegistrationRequestDTO;
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
import com.sovereign_ledger.service.NotificationService;
import com.sovereign_ledger.util.AesEncryptionUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
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
    private final NotificationService notificationService;

    @Value("${aes.secret-key}")
    private String aesSecretKey;

    public AdminServiceImplementation(UserRepository userRepository,
                                      PendingUserRepository pendingUserRepository,
                                      AccountRepository accountRepository,
                                      TransactionRepository transactionRepository,
                                      BCryptPasswordEncoder passwordEncoder,
                                      NotificationService notificationService) {
        this.userRepository = userRepository;
        this.pendingUserRepository = pendingUserRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
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
        Page<PendingUser> pendingPage = pendingUserRepository.findByRequestStatusIgnoreCaseOrderByRequestTimeDesc("Pending", pageable);
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
        if (!"Pending".equalsIgnoreCase(pendingUser.getRequestStatus())) {
            throw new IllegalArgumentException("Only pending requests can be approved.");
        }

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
            user.setCreatedAt(LocalDateTime.now());
            userRepository.save(user);
        }
        pendingUser.setExistingUser(user);

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
        account.setCreatedAt(LocalDateTime.now());
        accountRepository.save(account);
        pendingUser.setRequestStatus("Approved");
        pendingUser.setReviewedAt(LocalDateTime.now());
        pendingUserRepository.save(pendingUser);
        notificationService.createNotification(
                user.getUserId(),
                account.getAccountId(),
                null,
                "account-approved",
                "Account request approved",
                "Your " + account.getAccountType() + " account request has been approved and the account is ready to use."
        );

        notificationService.emitDataChange("pending-users", "accounts", "users", "notifications", "admin");

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
        if (!"Pending".equalsIgnoreCase(pendingUser.getRequestStatus())) {
            throw new IllegalArgumentException("Only pending requests can be rejected.");
        }

        pendingUser.setRequestStatus("Rejected");
        pendingUser.setReviewedAt(LocalDateTime.now());
        pendingUserRepository.save(pendingUser);

        User targetUser = pendingUser.getExistingUser();
        if (targetUser == null) {
            targetUser = userRepository.findByUserEmail(pendingUser.getUserEmail()).orElse(null);
        }
        if (targetUser != null) {
            notificationService.createNotification(
                    targetUser.getUserId(),
                    null,
                    null,
                    "account-request-rejected",
                    "Account request rejected",
                    "Your " + pendingUser.getRequestAccountType() + " account request submitted on "
                            + pendingUser.getRequestTime().toLocalDate() + " was rejected."
            );
        }

        notificationService.emitDataChange("pending-users", "notifications", "admin");
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
    public AnalyticsDashboardDTO getAnalyticsDashboard(Integer days) {
        int rangeDays = (days == null || days <= 0) ? 30 : days;
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(rangeDays - 1L);
        LocalDateTime startDateTime = startDate.atStartOfDay();

        List<Transaction> allTransactions = transactionRepository.findAll(Sort.by(Sort.Direction.ASC, "transactionTime"));
        List<Transaction> filteredTransactions = allTransactions.stream()
                .filter(transaction -> !transaction.getTransactionTime().isBefore(startDateTime))
                .toList();

        List<User> allUsers = userRepository.findAll();
        List<Account> allAccounts = accountRepository.findAll();
        List<PendingUser> pendingUsers = pendingUserRepository.findAll();

        return new AnalyticsDashboardDTO(
                buildDailyVolumeMetrics(filteredTransactions, startDate, today),
                buildTransactionDistributionMetrics(filteredTransactions),
                buildVolumeByAmountMetrics(filteredTransactions),
                buildAccountGrowthMetrics(allUsers, allAccounts, startDate, today),
                buildFlaggedTrendMetrics(filteredTransactions, startDate, today),
                buildNetFlowMetrics(filteredTransactions, startDate, today),
                buildApprovalAgingMetrics(pendingUsers),
                buildAccountStatusBreakdown(allAccounts),
                buildUserStatusBreakdown(allUsers),
                buildAdjustmentMetrics(filteredTransactions),
                buildComplianceReviewMetrics(filteredTransactions),
                buildTopUserTransactors(filteredTransactions),
                buildTopAccountTransactors(filteredTransactions)
        );
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
        validateAdministrativeAction(id, "update profile of");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setFirstName(request.getFirstName());
        user.setMiddleName(request.getMiddleName());
        user.setLastName(request.getLastName());
        user.setUserEmail(request.getUserEmail());
        user.setPhone(request.getPhone());
        UserResponseDTO response = toUserResponseDTO(userRepository.save(user));
        notificationService.createNotification(
                user.getUserId(),
                null,
                null,
                "profile-update",
                "Profile identity updated",
                "Your profile information has been securely updated by an administrator. Review your settings for current details."
        );
        notificationService.emitDataChange("users", "customer-profile", "notifications", "admin");
        return response;
    }

    @Override
    @Transactional
    public UserResponseDTO updateUserStatus(Integer id, String status) {
        validateAdministrativeAction(id, "suspend or reactivate");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setUserStatus(normalizeUserStatus(status));
        User savedUser = userRepository.save(user);
        if ("SUSPENDED".equalsIgnoreCase(savedUser.getUserStatus())) {
            notificationService.createNotification(
                    savedUser.getUserId(),
                    null,
                    null,
                    "user-suspended",
                    "Account access suspended",
                    "Your account access has been suspended by an administrator. You will be signed out immediately."
            );
        } else {
            notificationService.createNotification(
                    savedUser.getUserId(),
                    null,
                    null,
                    "user-reactivated",
                    "Account access restored",
                    "Your account has been restored and you can sign in again."
            );
        }
        UserResponseDTO response = toUserResponseDTO(savedUser);
        notificationService.emitDataChange("users", "notifications", "customer-profile", "admin");
        return response;
    }

    @Override
    @Transactional
    public UserResponseDTO updateUserRole(Integer id, String role) {
        validateAdministrativeAction(id, "change the role of");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        String newRole = normalizeRole(role);
        String currentRole = user.getRole().toLowerCase();

        // Enforce Role Domain Separation: Prevent Customer <-> Admin transitions
        boolean isCurrentAdmin = "admin".equals(currentRole) || "super_admin".equals(currentRole);
        boolean isNewAdmin = "admin".equals(newRole) || "super_admin".equals(newRole);

        if (isCurrentAdmin != isNewAdmin) {
            throw new AccessDeniedException("Administrative domain violation: Cannot transition between Customer and Administrator roles. To create a new administrator, please use the 'Add Administrative Account' tool.");
        }

        user.setRole(newRole);
        UserResponseDTO response = toUserResponseDTO(userRepository.save(user));
        notificationService.emitDataChange("users", "admin");
        return response;
    }

    @Override
    @Transactional
    public UserResponseDTO createAdmin(AdminRegistrationRequestDTO request) {
        // Only Super Admins can call this (enforced by SecurityConfig but checked here for safety)
        User currentUser = getCurrentUser();
        if (!"super_admin".equalsIgnoreCase(currentUser.getRole())) {
            throw new AccessDeniedException("Insufficient authority: Only super administrators can provision new administrative accounts.");
        }

        if (userRepository.findByUserEmail(request.getUserEmail()).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists.");
        }

        User admin = new User();
        admin.setFirstName(request.getFirstName());
        admin.setMiddleName(request.getMiddleName());
        admin.setLastName(request.getLastName());
        admin.setUserEmail(request.getUserEmail());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setRole(normalizeRole(request.getRole()));
        admin.setUserStatus("ACTIVE");
        admin.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(admin);
        notificationService.emitDataChange("users", "admin");
        return toUserResponseDTO(saved);
    }

    @Override
    @Transactional
    public AdminPasswordResetResponseDTO resetUserPassword(Integer id, String newPassword) {
        validateAdministrativeAction(id, "reset the password of");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        String password = (newPassword == null || newPassword.isBlank())
                ? UUID.randomUUID().toString().replace("-", "").substring(0, 12)
                : newPassword;
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
        notificationService.createNotification(
                user.getUserId(),
                null,
                null,
                "security-alert",
                "Administrative password reset",
                "Your account password has been reset by an administrator. Your new temporary password is: " + password + " - Please sign in and update your credentials immediately for maximal security."
        );
        notificationService.emitDataChange("users", "customer-profile", "notifications", "admin");
        return new AdminPasswordResetResponseDTO(user.getUserId(), password);
    }

    @Override
    @Transactional
    public AdminAccountDTO updateAccountStatus(Integer accountId, String status) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));
        account.setAccountStatus(normalizeAccountStatus(status));
        AdminAccountDTO updatedAccount = toAdminAccountDTO(accountRepository.save(account));
        notificationService.createNotification(
                account.getUser().getUserId(),
                account.getAccountId(),
                null,
                "account-status",
                "Account status updated",
                "Your " + account.getAccountType() + " account is now " + account.getAccountStatus() + "."
        );
        notificationService.emitDataChange("accounts", "notifications", "admin");
        return updatedAccount;
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
            Transaction latestTransaction = transactionRepository.findTopByAccount_AccountIdOrderByTransactionTimeDesc(accountId).orElse(null);
            notificationService.createNotification(
                    account.getUser().getUserId(),
                    account.getAccountId(),
                    latestTransaction == null ? null : latestTransaction.getTransactionId(),
                    "admin-adjustment",
                    "Administrative debit posted",
                    "An administrative debit of PHP " + amount + " was applied to your " + account.getAccountType() + " account. Reason: " + description
            );
            notificationService.emitDataChange("accounts", "transactions", "notifications", "admin");
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
        Transaction latestTransaction = transactionRepository.findTopByAccount_AccountIdOrderByTransactionTimeDesc(accountId).orElse(null);
        notificationService.createNotification(
                account.getUser().getUserId(),
                account.getAccountId(),
                latestTransaction == null ? null : latestTransaction.getTransactionId(),
                "admin-adjustment",
                "Administrative credit posted",
                "An administrative credit of PHP " + amount + " was applied to your " + account.getAccountType() + " account. Reason: " + description
        );
        notificationService.emitDataChange("accounts", "transactions", "notifications", "admin");
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
        Transaction saved = transactionRepository.save(transaction);
        notificationService.createNotification(
                saved.getAccount().getUser().getUserId(),
                saved.getAccount().getAccountId(),
                saved.getTransactionId(),
                "transaction-review",
                "Transaction status updated",
                "Transaction #" + saved.getTransactionId() + " is now " + saved.getTransactionStatus() +
                        ((saved.getReviewNote() == null || saved.getReviewNote().isBlank()) ? "." : ". Note: " + saved.getReviewNote())
        );
        notificationService.emitDataChange("transactions", "notifications", "admin");
        return mapToAuditLogEntry(saved);
    }

    @Override
    @Transactional
    public void deleteUser(Integer id) {
        validateAdministrativeAction(id, "delete");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        userRepository.delete(user);
        notificationService.emitDataChange("users", "admin");
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

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Current authenticated user not found in database."));
    }

    private void validateAdministrativeAction(Integer targetUserId, String action) {
        User currentUser = getCurrentUser();
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found with id: " + targetUserId));

        // Stricter self-action check: No admin can ever manage themselves through the admin portal
        if (currentUser.getUserId().equals(targetUserId)) {
            throw new AccessDeniedException("Administrative restriction: You cannot " + action + " your own account for security and audit integrity.");
        }

        String currentRole = currentUser.getRole().toLowerCase();
        String targetRole = targetUser.getRole().toLowerCase();

        // Authority Level Enforcement
        if (currentRole.equals("admin")) {
            // Standard Admins cannot manage other Admins or Super Admins
            if (targetRole.equals("admin") || targetRole.equals("super_admin")) {
                throw new AccessDeniedException("Insufficient authority: Standard administrators cannot manage other administrative accounts.");
            }
        }
        // Super Admins can manage everything except themselves
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
            case "user", "admin", "super_admin" -> normalized;
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

    private List<CategoryMetricDTO> buildDailyVolumeMetrics(List<Transaction> transactions, LocalDate startDate, LocalDate endDate) {
        Map<String, Double> counts = initDateSeries(startDate, endDate);
        transactions.forEach(transaction -> {
            String key = transaction.getTransactionTime().toLocalDate().format(DateTimeFormatter.ISO_DATE);
            counts.computeIfPresent(key, (ignored, current) -> current + 1);
        });
        return toCategoryMetricList(counts);
    }

    private List<CategoryMetricDTO> buildTransactionDistributionMetrics(List<Transaction> transactions) {
        Map<String, Double> distribution = new LinkedHashMap<>();
        transactions.forEach(transaction -> distribution.merge(transaction.getTransactionType(), 1.0, Double::sum));
        return toCategoryMetricList(distribution);
    }

    private List<CategoryMetricDTO> buildVolumeByAmountMetrics(List<Transaction> transactions) {
        Map<String, Double> buckets = new LinkedHashMap<>();
        buckets.put("0-1k", 0.0);
        buckets.put("1k-10k", 0.0);
        buckets.put("10k-100k", 0.0);
        buckets.put("100k+", 0.0);

        transactions.forEach(transaction -> {
            BigDecimal amount = Optional.ofNullable(transaction.getTransactionAmount()).orElse(BigDecimal.ZERO).abs();
            String bucket = amount.compareTo(new BigDecimal("1000")) < 0 ? "0-1k"
                    : amount.compareTo(new BigDecimal("10000")) < 0 ? "1k-10k"
                    : amount.compareTo(new BigDecimal("100000")) < 0 ? "10k-100k"
                    : "100k+";
            buckets.merge(bucket, 1.0, Double::sum);
        });

        return toCategoryMetricList(buckets);
    }

    private List<CategoryMetricDTO> buildAccountGrowthMetrics(List<User> users, List<Account> accounts, LocalDate startDate, LocalDate endDate) {
        Map<String, Double> growth = initDateSeries(startDate, endDate);
        users.stream()
                .filter(user -> user.getCreatedAt() != null && !user.getCreatedAt().toLocalDate().isBefore(startDate))
                .forEach(user -> incrementMetric(growth, user.getCreatedAt().toLocalDate()));
        accounts.stream()
                .filter(account -> account.getCreatedAt() != null && !account.getCreatedAt().toLocalDate().isBefore(startDate))
                .forEach(account -> incrementMetric(growth, account.getCreatedAt().toLocalDate()));
        return toCategoryMetricList(growth);
    }

    private List<CategoryMetricDTO> buildFlaggedTrendMetrics(List<Transaction> transactions, LocalDate startDate, LocalDate endDate) {
        Map<String, Double> flags = initDateSeries(startDate, endDate);
        transactions.stream()
                .filter(transaction -> {
                    String status = Optional.ofNullable(transaction.getTransactionStatus()).orElse("").toLowerCase();
                    return status.equals("failed") || status.equals("declined") || status.equals("review required") || status.equals("escalated");
                })
                .forEach(transaction -> incrementMetric(flags, transaction.getTransactionTime().toLocalDate()));
        return toCategoryMetricList(flags);
    }

    private List<CategoryMetricDTO> buildNetFlowMetrics(List<Transaction> transactions, LocalDate startDate, LocalDate endDate) {
        Map<String, Double> flow = initDateSeries(startDate, endDate);
        transactions.forEach(transaction -> {
            String key = transaction.getTransactionTime().toLocalDate().format(DateTimeFormatter.ISO_DATE);
            double amount = Optional.ofNullable(transaction.getTransactionAmount()).orElse(BigDecimal.ZERO).doubleValue();
            double signed = "debit".equalsIgnoreCase(transaction.getTransactionType()) ? -amount : amount;
            flow.computeIfPresent(key, (ignored, current) -> current + signed);
        });
        return toCategoryMetricList(flow);
    }

    private List<CategoryMetricDTO> buildApprovalAgingMetrics(List<PendingUser> pendingUsers) {
        Map<String, Double> aging = new LinkedHashMap<>();
        aging.put("same-day", 0.0);
        aging.put("1-3 days", 0.0);
        aging.put("3+ days", 0.0);

        LocalDate today = LocalDate.now();
        pendingUsers.forEach(user -> {
            long ageDays = java.time.Duration.between(user.getRequestTime(), today.plusDays(1).atStartOfDay()).toDays();
            String bucket = ageDays <= 1 ? "same-day" : ageDays <= 3 ? "1-3 days" : "3+ days";
            aging.merge(bucket, 1.0, Double::sum);
        });
        return toCategoryMetricList(aging);
    }

    private List<CategoryMetricDTO> buildAccountStatusBreakdown(List<Account> accounts) {
        Map<String, Double> breakdown = new LinkedHashMap<>();
        accounts.forEach(account -> breakdown.merge(account.getAccountStatus(), 1.0, Double::sum));
        return toCategoryMetricList(breakdown);
    }

    private List<CategoryMetricDTO> buildUserStatusBreakdown(List<User> users) {
        Map<String, Double> breakdown = new LinkedHashMap<>();
        users.forEach(user -> breakdown.merge(user.getUserStatus(), 1.0, Double::sum));
        return toCategoryMetricList(breakdown);
    }

    private List<CategoryMetricDTO> buildAdjustmentMetrics(List<Transaction> transactions) {
        Map<String, Double> metrics = new LinkedHashMap<>();
        metrics.put("credit adjustments", 0.0);
        metrics.put("debit adjustments", 0.0);

        transactions.stream()
                .filter(transaction -> Optional.ofNullable(transaction.getTransactionDescription()).orElse("").toLowerCase().contains("admin adjustment"))
                .forEach(transaction -> {
                    String bucket = "debit".equalsIgnoreCase(transaction.getTransactionType()) ? "debit adjustments" : "credit adjustments";
                    metrics.merge(bucket, Optional.ofNullable(transaction.getTransactionAmount()).orElse(BigDecimal.ZERO).doubleValue(), Double::sum);
                });

        return toCategoryMetricList(metrics);
    }

    private List<CategoryMetricDTO> buildComplianceReviewMetrics(List<Transaction> transactions) {
        Map<String, Double> metrics = new LinkedHashMap<>();
        metrics.put("reviewed", 0.0);
        metrics.put("escalated", 0.0);
        metrics.put("review required", 0.0);

        transactions.forEach(transaction -> {
            String status = Optional.ofNullable(transaction.getTransactionStatus()).orElse("").toLowerCase();
            if (metrics.containsKey(status)) {
                metrics.merge(status, 1.0, Double::sum);
            }
        });
        return toCategoryMetricList(metrics);
    }

    private List<TopTransactorDTO> buildTopUserTransactors(List<Transaction> transactions) {
        Map<Integer, TopTransactorAccumulator> accumulators = new LinkedHashMap<>();
        transactions.forEach(transaction -> {
            Integer userId = transaction.getAccount().getUser().getUserId();
            TopTransactorAccumulator accumulator = accumulators.computeIfAbsent(userId, ignored ->
                    new TopTransactorAccumulator(
                            userId,
                            transaction.getAccount().getUser().getFirstName() + " " + transaction.getAccount().getUser().getLastName()
                    ));
            accumulator.add(Optional.ofNullable(transaction.getTransactionAmount()).orElse(BigDecimal.ZERO));
        });
        return accumulators.values().stream()
                .sorted((left, right) -> right.totalAmount.compareTo(left.totalAmount))
                .limit(5)
                .map(TopTransactorAccumulator::toDto)
                .toList();
    }

    private List<TopTransactorDTO> buildTopAccountTransactors(List<Transaction> transactions) {
        Map<Integer, TopTransactorAccumulator> accumulators = new LinkedHashMap<>();
        transactions.forEach(transaction -> {
            Integer accountId = transaction.getAccount().getAccountId();
            TopTransactorAccumulator accumulator = accumulators.computeIfAbsent(accountId, ignored ->
                    new TopTransactorAccumulator(
                            accountId,
                            decryptAccountNumber(transaction.getAccount().getAccountNumber())
                    ));
            accumulator.add(Optional.ofNullable(transaction.getTransactionAmount()).orElse(BigDecimal.ZERO));
        });
        return accumulators.values().stream()
                .sorted((left, right) -> right.totalAmount.compareTo(left.totalAmount))
                .limit(5)
                .map(TopTransactorAccumulator::toDto)
                .toList();
    }

    private Map<String, Double> initDateSeries(LocalDate startDate, LocalDate endDate) {
        Map<String, Double> series = new LinkedHashMap<>();
        for (LocalDate cursor = startDate; !cursor.isAfter(endDate); cursor = cursor.plusDays(1)) {
            series.put(cursor.format(DateTimeFormatter.ISO_DATE), 0.0);
        }
        return series;
    }

    private void incrementMetric(Map<String, Double> series, LocalDate date) {
        String key = date.format(DateTimeFormatter.ISO_DATE);
        series.computeIfPresent(key, (ignored, current) -> current + 1);
    }

    private List<CategoryMetricDTO> toCategoryMetricList(Map<String, Double> metrics) {
        return metrics.entrySet().stream()
                .map(entry -> new CategoryMetricDTO(entry.getKey(), entry.getValue()))
                .toList();
    }

    private String generateAccountNumber() {
        long number = (long) (Math.random() * 9_000_000_000L) + 1_000_000_000L;
        return String.valueOf(number);
    }

    private static class TopTransactorAccumulator {
        private final Integer id;
        private final String label;
        private BigDecimal totalAmount = BigDecimal.ZERO;
        private int transactionCount = 0;

        private TopTransactorAccumulator(Integer id, String label) {
            this.id = id;
            this.label = label;
        }

        private void add(BigDecimal amount) {
            totalAmount = totalAmount.add(amount.abs());
            transactionCount++;
        }

        private TopTransactorDTO toDto() {
            return new TopTransactorDTO(id, label, totalAmount, transactionCount);
        }
    }
}

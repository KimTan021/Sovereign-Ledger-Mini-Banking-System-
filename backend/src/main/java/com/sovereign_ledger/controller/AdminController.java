package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.request.AdminAccountStatusRequestDTO;
import com.sovereign_ledger.dto.request.AdminAdjustmentRequestDTO;
import com.sovereign_ledger.dto.request.AdminPasswordResetRequestDTO;
import com.sovereign_ledger.dto.request.AdminTransactionReviewRequestDTO;
import com.sovereign_ledger.dto.request.AdminUserProfileUpdateRequestDTO;
import com.sovereign_ledger.dto.request.AdminUserRoleUpdateRequestDTO;
import com.sovereign_ledger.dto.request.AdminUserStatusRequestDTO;
import com.sovereign_ledger.dto.response.*;
import com.sovereign_ledger.entity.PendingUser;
import com.sovereign_ledger.repository.PendingUserRepository;
import com.sovereign_ledger.service.AdminService;
import com.sovereign_ledger.service.SeedTransactionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    private final PendingUserRepository pendingUserRepository;
    private final SeedTransactionService seedTransactionService;

    public AdminController(AdminService adminService,
                           PendingUserRepository pendingUserRepository,
                           SeedTransactionService seedTransactionService) {
        this.adminService = adminService;
        this.pendingUserRepository = pendingUserRepository;
        this.seedTransactionService = seedTransactionService;
    }

    @GetMapping("/users")
    public ResponseEntity<PaginatedResponseDTO<UserResponseDTO>> findAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.findAllUsers(PageRequest.of(page, size)));
    }

    @GetMapping("/pending-users")
    public ResponseEntity<PaginatedResponseDTO<PendingUserResponseDTO>> findAllPendingUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.findAllPendingUsers(PageRequest.of(page, size)));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getSystemStats() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    @GetMapping("/high-value")
    public ResponseEntity<List<TopAccountDTO>> getHighValueAccounts() {
        return ResponseEntity.ok(adminService.getHighValueAccounts());
    }

    @GetMapping("/audit-log")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }

    @GetMapping("/audit-log/all")
    public ResponseEntity<PaginatedResponseDTO<AuditLogDTO>> getFullAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getFullAuditLogs(PageRequest.of(page, size, Sort.by("transactionTime").descending())));
    }

    @GetMapping("/transactions")
    public ResponseEntity<PaginatedResponseDTO<AuditLogDTO>> searchTransactions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) Integer accountId,
            @RequestParam(required = false) java.math.BigDecimal minAmount,
            @RequestParam(required = false) java.math.BigDecimal maxAmount,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.searchTransactions(
                search,
                userId,
                accountId,
                minAmount,
                maxAmount,
                type,
                status,
                dateFrom,
                dateTo,
                PageRequest.of(page, size)
        ));
    }

    @GetMapping("/analytics/volume")
    public ResponseEntity<List<CategoryMetricDTO>> getDailyVolume() {
        return ResponseEntity.ok(adminService.getDailyVolume());
    }

    @GetMapping("/analytics/distribution")
    public ResponseEntity<List<CategoryMetricDTO>> getTransactionDistribution() {
        return ResponseEntity.ok(adminService.getTransactionDistribution());
    }

    @GetMapping("/analytics/dashboard")
    public ResponseEntity<AnalyticsDashboardDTO> getAnalyticsDashboard(
            @RequestParam(defaultValue = "30") Integer days) {
        return ResponseEntity.ok(adminService.getAnalyticsDashboard(days));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDetailDTO> getUserDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.findUserDetail(id));
    }

    @PutMapping("/users/{id}/profile")
    public ResponseEntity<UserResponseDTO> updateUserProfile(@PathVariable Integer id,
                                                             @Valid @RequestBody AdminUserProfileUpdateRequestDTO request) {
        return ResponseEntity.ok(adminService.updateUserProfile(id, request));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserResponseDTO> updateUserStatus(@PathVariable Integer id,
                                                            @Valid @RequestBody AdminUserStatusRequestDTO request) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, request.getStatus()));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponseDTO> updateUserRole(@PathVariable Integer id,
                                                          @Valid @RequestBody AdminUserRoleUpdateRequestDTO request) {
        return ResponseEntity.ok(adminService.updateUserRole(id, request.getRole()));
    }

    @PutMapping("/users/{id}/reset-password")
    public ResponseEntity<AdminPasswordResetResponseDTO> resetUserPassword(@PathVariable Integer id,
                                                                           @Valid @RequestBody(required = false) AdminPasswordResetRequestDTO request) {
        String password = request == null ? null : request.getNewPassword();
        return ResponseEntity.ok(adminService.resetUserPassword(id, password));
    }

    @PutMapping("/accounts/{id}/status")
    public ResponseEntity<AdminAccountDTO> updateAccountStatus(@PathVariable Integer id,
                                                               @Valid @RequestBody AdminAccountStatusRequestDTO request) {
        return ResponseEntity.ok(adminService.updateAccountStatus(id, request.getStatus()));
    }

    @PostMapping("/accounts/{id}/adjustment")
    public ResponseEntity<Void> postAdjustment(@PathVariable Integer id,
                                               @Valid @RequestBody AdminAdjustmentRequestDTO request) {
        adminService.postAccountAdjustment(id, request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/transactions/{id}/review")
    public ResponseEntity<AuditLogDTO> reviewTransaction(@PathVariable Integer id,
                                                         @Valid @RequestBody AdminTransactionReviewRequestDTO request) {
        return ResponseEntity.ok(adminService.reviewTransaction(id, request.getStatus(), request.getNote()));
    }

    @PutMapping("/pending-users/{id}/approve")
    public ResponseEntity<UserApprovalResponseDTO> approvePendingUser(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.approvePendingUser(id));
    }

    @DeleteMapping("/pending-users/{id}/reject")
    public ResponseEntity<Void> rejectPendingUser(@PathVariable Integer id) {
        adminService.rejectPendingUser(id);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/seed/approve-all")
    public ResponseEntity<Map<String, Object>> approveAllPendingUsers() {
        List<PendingUser> pending = pendingUserRepository
                .findByRequestStatusIgnoreCaseOrderByRequestTimeDesc("Pending", PageRequest.of(0, Integer.MAX_VALUE))
                .getContent();

        if (pending.isEmpty()) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "skipped");
            response.put("message", "No pending users found.");
            return ResponseEntity.badRequest().body(response);
        }

        List<UserApprovalResponseDTO> approved = pending.stream()
                .map(p -> adminService.approvePendingUser(p.getUserId())) // through service
                .collect(Collectors.toList());

        // Seed backdated transactions for the first 3 newly approved users
        List<Integer> approvedUserIds = approved.stream()
                .map(UserApprovalResponseDTO::getUserId)
                .collect(Collectors.toList());
        seedTransactionService.seedForApprovedUsers(approvedUserIds);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        response.put("message", approved.size() + " pending users approved and accounts created.");
        response.put("approved_users", approved);
        return ResponseEntity.ok(response);
    }
}

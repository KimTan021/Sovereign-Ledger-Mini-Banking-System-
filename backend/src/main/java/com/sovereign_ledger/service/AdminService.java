package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.response.*;
import com.sovereign_ledger.dto.request.*;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface AdminService {

    PaginatedResponseDTO<UserResponseDTO> findAllUsers(Pageable pageable);
    PaginatedResponseDTO<PendingUserResponseDTO> findAllPendingUsers(Pageable pageable);
    UserApprovalResponseDTO approvePendingUser(Integer id);
    void rejectPendingUser(Integer id);

    AdminStatsDTO getSystemStats();
    List<TopAccountDTO> getHighValueAccounts();
    List<AuditLogDTO> getAuditLogs();
    
    List<CategoryMetricDTO> getDailyVolume();
    List<CategoryMetricDTO> getTransactionDistribution();
    AnalyticsDashboardDTO getAnalyticsDashboard(Integer days);
    PaginatedResponseDTO<AuditLogDTO> getFullAuditLogs(Pageable pageable);
    AdminUserDetailDTO findUserDetail(Integer id);
    UserResponseDTO updateUserProfile(Integer id, AdminUserProfileUpdateRequestDTO request);
    UserResponseDTO updateUserStatus(Integer id, String status);
    UserResponseDTO updateUserRole(Integer id, String role);
    AdminPasswordResetResponseDTO resetUserPassword(Integer id, String newPassword);
    AdminAccountDTO updateAccountStatus(Integer accountId, String status);
    void postAccountAdjustment(Integer accountId, AdminAdjustmentRequestDTO request);
    PaginatedResponseDTO<AuditLogDTO> searchTransactions(
            String search,
            Integer userId,
            Integer accountId,
            BigDecimal minAmount,
            BigDecimal maxAmount,
            String type,
            String status,
            String dateFrom,
            String dateTo,
            Pageable pageable
    );
    AuditLogDTO reviewTransaction(Integer transactionId, String status, String note);
    void deleteUser(Integer id);
    UserResponseDTO createAdmin(AdminRegistrationRequestDTO request);
}

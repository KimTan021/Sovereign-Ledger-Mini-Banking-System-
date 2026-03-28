package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.response.UserApprovalResponseDTO;
import com.sovereign_ledger.dto.response.PendingUserResponseDTO;
import com.sovereign_ledger.dto.response.UserResponseDTO;

import java.util.List;

public interface AdminService {

    List<UserResponseDTO> findAllUsers();
    List<PendingUserResponseDTO> findAllPendingUsers();
    UserApprovalResponseDTO approvePendingUser(Integer id);
    void rejectPendingUser(Integer id);
}

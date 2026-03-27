package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.request.PendingUserRequestDTO;
import com.sovereign_ledger.dto.response.PendingUserResponseDTO;
import com.sovereign_ledger.entity.PendingUser;

import java.util.List;

public interface PendingUserService {
    PendingUserResponseDTO savePendingUser(PendingUserRequestDTO dto);
}

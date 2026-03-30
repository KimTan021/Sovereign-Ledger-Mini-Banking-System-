package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.request.LoginRequestDTO;
import com.sovereign_ledger.dto.response.LoginResponseDTO;
import org.springframework.stereotype.Service;

public interface AuthService {

    LoginResponseDTO login (LoginRequestDTO request);
}

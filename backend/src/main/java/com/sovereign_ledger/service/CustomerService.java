package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.request.CustomerPasswordChangeRequestDTO;
import com.sovereign_ledger.dto.request.CustomerProfileUpdateRequestDTO;
import com.sovereign_ledger.dto.response.CustomerProfileDTO;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.exception.exception_classes.UserNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.RequestBody;

public interface CustomerService {
    public ResponseEntity<CustomerProfileDTO> getProfile(UserDetails userDetails);

    public ResponseEntity<CustomerProfileDTO> updateProfile(CustomerProfileUpdateRequestDTO request,
                                                            UserDetails userDetails);

    public ResponseEntity<String> changePassword(CustomerPasswordChangeRequestDTO request,
                                                 UserDetails userDetails);
}

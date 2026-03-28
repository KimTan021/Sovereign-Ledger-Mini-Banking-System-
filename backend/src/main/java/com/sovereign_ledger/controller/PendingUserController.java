package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.request.AdditionalAccountRequestDTO;
import com.sovereign_ledger.dto.request.PendingUserRequestDTO;
import com.sovereign_ledger.dto.response.PendingUserResponseDTO;
import com.sovereign_ledger.entity.PendingUser;
import com.sovereign_ledger.service.PendingUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pending-user")
public class PendingUserController {
    private final PendingUserService pendingUserService;

    public PendingUserController(PendingUserService pendingUserService) {
        this.pendingUserService = pendingUserService;
    }

    @PostMapping("/apply")
    public ResponseEntity<PendingUserResponseDTO> savePendingUser(@Valid @RequestBody PendingUserRequestDTO dto){
        return ResponseEntity.status(HttpStatus.CREATED).body(pendingUserService.savePendingUser(dto));
    }

    @PostMapping("/request-account")
    public ResponseEntity<PendingUserResponseDTO> requestAdditionalAccount(
            @Valid @RequestBody AdditionalAccountRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pendingUserService.requestAdditionalAccount(dto, userDetails.getUsername()));
    }

}

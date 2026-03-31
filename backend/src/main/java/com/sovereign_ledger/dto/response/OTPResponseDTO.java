package com.sovereign_ledger.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OTPResponseDTO {
    private String message;
    private String email;
    private String otpPurpose;
    private LocalDateTime expiresAt;
}
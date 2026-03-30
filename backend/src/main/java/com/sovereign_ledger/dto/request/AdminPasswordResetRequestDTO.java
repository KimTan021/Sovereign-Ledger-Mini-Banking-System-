package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminPasswordResetRequestDTO {
    @Size(max = 72, message = "New password must not exceed 72 characters.")
    private String newPassword;
}

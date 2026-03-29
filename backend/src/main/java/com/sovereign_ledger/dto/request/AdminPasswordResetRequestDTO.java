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
    @Size(min = 8, max = 72, message = "New password must be between 8 and 72 characters.")
    private String newPassword;
}

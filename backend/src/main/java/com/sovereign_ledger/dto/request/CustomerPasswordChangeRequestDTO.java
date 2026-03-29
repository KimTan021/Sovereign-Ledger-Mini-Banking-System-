package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerPasswordChangeRequestDTO {
    @NotBlank(message = "Current password is required.")
    @Size(min = 8, max = 72, message = "Current password must be between 8 and 72 characters.")
    private String currentPassword;

    @NotBlank(message = "New password is required.")
    @Size(min = 8, max = 72, message = "New password must be between 8 and 72 characters.")
    private String newPassword;
}

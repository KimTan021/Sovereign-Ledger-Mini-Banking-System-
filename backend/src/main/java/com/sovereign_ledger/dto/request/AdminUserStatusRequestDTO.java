package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserStatusRequestDTO {
    @NotBlank(message = "User status is required.")
    @Pattern(regexp = "^(?i)(active|suspended)$", message = "User status must be ACTIVE or SUSPENDED.")
    private String status;
}

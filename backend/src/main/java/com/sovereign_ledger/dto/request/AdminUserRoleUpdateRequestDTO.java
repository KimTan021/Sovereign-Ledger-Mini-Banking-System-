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
public class AdminUserRoleUpdateRequestDTO {
    @NotBlank(message = "Role is required.")
    @Pattern(regexp = "^(?i)(user|admin)$", message = "Role must be user or admin.")
    private String role;
}

package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminRegistrationRequestDTO {

    @NotBlank(message = "First name is required")
    @Size(max = 45, message = "First name cannot exceed 45 characters")
    private String firstName;

    @Size(max = 45, message = "Middle name cannot exceed 45 characters")
    private String middleName;

    @NotBlank(message = "Last name is required")
    @Size(max = 45, message = "Last name cannot exceed 45 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    @Size(max = 512, message = "Email cannot exceed 512 characters")
    private String userEmail;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "admin|super_admin", message = "Role must be either 'admin' or 'super_admin'")
    private String role;
}

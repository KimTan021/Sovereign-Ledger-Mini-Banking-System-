package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserProfileUpdateRequestDTO {
    @NotBlank(message = "First name is required.")
    @Size(min = 2, max = 45, message = "First name must be between 2 and 45 characters.")
    @Pattern(regexp = "^[A-Za-z][A-Za-z\\s'\\-]*$", message = "First name may only contain letters, spaces, apostrophes, and hyphens.")
    private String firstName;

    @Size(max = 45, message = "Middle name must not exceed 45 characters.")
    @Pattern(regexp = "^$|^[A-Za-z][A-Za-z\\s'\\-]*$", message = "Middle name may only contain letters, spaces, apostrophes, and hyphens.")
    private String middleName;

    @NotBlank(message = "Last name is required.")
    @Size(min = 2, max = 45, message = "Last name must be between 2 and 45 characters.")
    @Pattern(regexp = "^[A-Za-z][A-Za-z\\s'\\-]*$", message = "Last name may only contain letters, spaces, apostrophes, and hyphens.")
    private String lastName;

    @NotBlank(message = "Email address is required.")
    @Email(message = "Enter a valid email address.")
    @Size(max = 512, message = "Email address must not exceed 512 characters.")
    private String userEmail;

    @Pattern(regexp = "^$|^\\+?[0-9 ]{10,15}$", message = "Phone number must contain 10 to 15 digits and may include spaces or a leading plus sign.")
    private String phone;
}

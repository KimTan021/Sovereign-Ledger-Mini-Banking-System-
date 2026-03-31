package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class PendingUserRequestDTO {

    @NotBlank(message = "First name is required.")
    @Size(min = 2, max = 45, message = "First name must be between 2 and 45 characters.")
    @Pattern(regexp = "^[A-Za-z][A-Za-z\\s'\\-]*$", message = "First name may only contain letters, spaces, apostrophes, and hyphens.")
    private String firstName;

    @Size(max = 45, message = "Middle name must not exceed 45 characters.")
    @Pattern(regexp = "^$|^[A-Za-z][A-Za-z\\s'\\-]{1,44}$", message = "Middle name must be at least 2 characters if provided and may only contain letters, spaces, apostrophes, and hyphens.")
    private String middleName;

    @NotBlank(message = "Last name is required.")
    @Size(min = 2, max = 45, message = "Last name must be between 2 and 45 characters.")
    @Pattern(regexp = "^[A-Za-z][A-Za-z\\s'\\-]*$", message = "Last name may only contain letters, spaces, apostrophes, and hyphens.")
    private String lastName;

    @NotBlank(message = "Email address is required.")
    @Email(message = "Enter a valid email address.")
    @Size(max = 512, message = "Email address must not exceed 512 characters.")
    private String userEmail;

    @NotBlank(message = "Password is required.")
    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters.")
    private String password;

    @NotBlank(message = "Account type is required.")
    @Pattern(regexp = "^(?i)(savings|checking)$", message = "Account type must be Savings or Checking.")
    private String requestAccountType;

    @NotBlank(message = "Phone number is required.")
    @Pattern(regexp = "^\\+?[0-9 ]{10,15}$", message = "Phone number must contain 10 to 15 digits and may include spaces or a leading plus sign.")
    private String phone;

    @NotNull(message = "Initial deposit is required.")
    @DecimalMin(value = "1000.00", inclusive = true, message = "Initial deposit must be at least PHP 1,000.00.")
    @DecimalMax(value = "99999999999999.99", message = "Initial deposit exceeds institutional limit.")
    @Digits(integer = 14, fraction = 2, message = "Initial deposit format is invalid.")
    private BigDecimal initialDeposit;

    public PendingUserRequestDTO() {}

    public PendingUserRequestDTO(String firstName, String middleName, String lastName, String userEmail, String password, String requestAccountType, String phone, BigDecimal initialDeposit) {
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.userEmail = userEmail;
        this.password = password;
        this.requestAccountType = requestAccountType;
        this.phone = phone;
        this.initialDeposit = initialDeposit;
    }
}

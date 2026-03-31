package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdditionalAccountRequestDTO {
    @NotBlank(message = "Account type is required.")
    @Pattern(regexp = "^(?i)(savings|checking)$", message = "Account type must be Savings or Checking.")
    private String requestAccountType;

    @NotNull(message = "Initial deposit is required.")
    @DecimalMin(value = "1000.00", inclusive = true, message = "Initial deposit must be at least PHP 1,000.00.")
    @DecimalMax(value = "99999999999999.99", message = "Initial deposit exceeds institutional limit.")
    @Digits(integer = 14, fraction = 2, message = "Initial deposit format is invalid.")
    private BigDecimal initialDeposit;
}

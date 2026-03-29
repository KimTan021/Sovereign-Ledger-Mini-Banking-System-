package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.DecimalMin;
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
    private BigDecimal initialDeposit;
}

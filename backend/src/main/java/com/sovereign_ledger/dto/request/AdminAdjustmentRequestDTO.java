package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminAdjustmentRequestDTO {
    @NotNull(message = "Adjustment amount is required.")
    @DecimalMin(value = "0.01", inclusive = true, message = "Adjustment amount must be greater than zero.")
    private BigDecimal amount;

    @NotBlank(message = "Adjustment type is required.")
    @Pattern(regexp = "^(?i)(credit|debit)$", message = "Adjustment type must be credit or debit.")
    private String adjustmentType;

    @NotBlank(message = "Adjustment reason is required.")
    @Size(min = 5, max = 150, message = "Adjustment reason must be between 5 and 150 characters.")
    private String description;
}

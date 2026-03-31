package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class CashTransactionRequestDTO {
    @NotNull(message = "Account is required.")
    @Positive(message = "Account is invalid.")
    private Integer accountId;

    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "0.01", inclusive = true, message = "Amount must be greater than zero.")
    @DecimalMax(value = "99999999999999.99", message = "Amount exceeds institutional limit.")
    @Digits(integer = 14, fraction = 2, message = "Amount format is invalid.")
    private BigDecimal transAmount;

    @NotBlank(message = "Description is required.")
    @Size(min = 3, max = 150, message = "Description must be between 3 and 150 characters.")
    private String description;
}

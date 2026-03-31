package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequestDTO {
    @NotNull(message = "Source account is required.")
    @Positive(message = "Source account is invalid.")
    private Integer sourceAccountId;

    @NotNull(message = "Receiving account is required.")
    @Positive(message = "Receiving account is invalid.")
    private Integer receivingAccountId;

    @NotNull(message = "Transfer amount is required.")
    @DecimalMin(value = "0.01", inclusive = true, message = "Transfer amount must be greater than zero.")
    @DecimalMax(value = "99999999999999.99", message = "Transfer amount exceeds institutional limit.")
    @Digits(integer = 14, fraction = 2, message = "Transfer amount format is invalid.")
    private BigDecimal transAmount;

    @NotBlank(message = "Transfer log is required.")
    @Size(max = 500, message = "Transfer log must not exceed 500 characters.")
    private String logs;

    @NotBlank(message = "Transfer description is required.")
    @Size(min = 3, max = 150, message = "Transfer description must be between 3 and 150 characters.")
    private String transactionDescription;
}

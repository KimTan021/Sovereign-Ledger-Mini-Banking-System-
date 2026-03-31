package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class TransferByAccountNumberRequestDTO {
    @NotNull(message = "Source account is required.")
    @Positive(message = "Source account is invalid.")
    private Integer sourceAccountId;

    @NotBlank(message = "Recipient account number is required.")
    @Pattern(regexp = "^[0-9]{10,18}$", message = "Recipient account number must be 10 to 18 digits.")
    private String targetAccountNumber;

    @NotNull(message = "Transfer amount is required.")
    @DecimalMin(value = "0.01", inclusive = true, message = "Transfer amount must be greater than zero.")
    @DecimalMax(value = "99999999999999.99", message = "Transfer amount exceeds institutional limit.")
    @Digits(integer = 14, fraction = 2, message = "Transfer amount format is invalid.")
    private BigDecimal transAmount;

    @NotBlank(message = "Transfer purpose is required.")
    @Size(min = 3, max = 150, message = "Transfer purpose must be between 3 and 150 characters.")
    private String description;

    // Getters and Setters
    public Integer getSourceAccountId() {
        return sourceAccountId;
    }

    public void setSourceAccountId(Integer sourceAccountId) {
        this.sourceAccountId = sourceAccountId;
    }

    public String getTargetAccountNumber() {
        return targetAccountNumber;
    }

    public void setTargetAccountNumber(String targetAccountNumber) {
        this.targetAccountNumber = targetAccountNumber;
    }

    public BigDecimal getTransAmount() {
        return transAmount;
    }

    public void setTransAmount(BigDecimal transAmount) {
        this.transAmount = transAmount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

package com.sovereign_ledger.dto.request;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@NoArgsConstructor
@AllArgsConstructor
public class TransactionLogRequestDTO {
    private Integer sourceAccountId;
    private String transactionType;
    private BigDecimal transactionAmount;
    private Integer targetAccountId;
    private String logs;
    private String transactionDescription;
    private String transactionStatus;
    private String targetAccountNumber;
    private String targetAccountName;
    private LocalDateTime transactionTime;

    public Integer getSourceAccountId() { return sourceAccountId; }
    public void setSourceAccountId(Integer sourceAccountId) { this.sourceAccountId = sourceAccountId; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public BigDecimal getTransactionAmount() { return transactionAmount; }
    public void setTransactionAmount(BigDecimal transactionAmount) { this.transactionAmount = transactionAmount; }

    public Integer getTargetAccountId() { return targetAccountId; }
    public void setTargetAccountId(Integer targetAccountId) { this.targetAccountId = targetAccountId; }

    public String getLogs() { return logs; }
    public void setLogs(String logs) { this.logs = logs; }

    public String getTransactionDescription() { return transactionDescription; }
    public void setTransactionDescription(String transactionDescription) { this.transactionDescription = transactionDescription; }

    public String getTransactionStatus() { return transactionStatus; }
    public void setTransactionStatus(String transactionStatus) { this.transactionStatus = transactionStatus; }

    public String getTargetAccountNumber() { return targetAccountNumber; }
    public void setTargetAccountNumber(String targetAccountNumber) { this.targetAccountNumber = targetAccountNumber; }

    public String getTargetAccountName() { return targetAccountName; }
    public void setTargetAccountName(String targetAccountName) { this.targetAccountName = targetAccountName; }

    public LocalDateTime getTransactionTime() { return transactionTime; }
    public void setTransactionTime(LocalDateTime transactionTime) { this.transactionTime = transactionTime; }
}
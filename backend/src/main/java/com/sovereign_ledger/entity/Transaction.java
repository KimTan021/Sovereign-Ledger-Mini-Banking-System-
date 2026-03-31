package com.sovereign_ledger.entity;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="transaction")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Integer transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "transaction_type")
    private String transactionType;

    @Column(name = "transaction_amount")
    private BigDecimal transactionAmount;

    @Column(name = "account_id_destination")
    private Integer accountIdDestination;

    @Column(name = "logs")
    private String logs;

    @Column(name = "transaction_time")
    private LocalDateTime transactionTime;

    @Column(name = "transaction_description")
    private String transactionDescription;

    @Column(name = "transaction_status")
    private String transactionStatus;

    @Column(name = "target_account_number")
    private String targetAccountNumber;

    @Column(name = "target_account_name")
    private String targetAccountName;

    @Column(name = "review_note")
    private String reviewNote;

    public Integer getTransactionId() { return transactionId; }
    public void setTransactionId(Integer transactionId) { this.transactionId = transactionId; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public BigDecimal getTransactionAmount() { return transactionAmount; }
    public void setTransactionAmount(BigDecimal transactionAmount) { this.transactionAmount = transactionAmount; }

    public Integer getAccountIdDestination() { return accountIdDestination; }
    public void setAccountIdDestination(Integer accountIdDestination) { this.accountIdDestination = accountIdDestination; }

    public String getLogs() { return logs; }
    public void setLogs(String logs) { this.logs = logs; }

    public LocalDateTime getTransactionTime() { return transactionTime; }
    public void setTransactionTime(LocalDateTime transactionTime) { this.transactionTime = transactionTime; }

    public String getTransactionDescription() { return transactionDescription; }
    public void setTransactionDescription(String transactionDescription) { this.transactionDescription = transactionDescription; }

    public String getTransactionStatus() { return transactionStatus; }
    public void setTransactionStatus(String transactionStatus) { this.transactionStatus = transactionStatus; }

    public String getTargetAccountNumber() { return targetAccountNumber; }
    public void setTargetAccountNumber(String targetAccountNumber) { this.targetAccountNumber = targetAccountNumber; }

    public String getTargetAccountName() { return targetAccountName; }
    public void setTargetAccountName(String targetAccountName) { this.targetAccountName = targetAccountName; }

    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }
}

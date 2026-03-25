package com.sovereign_ledger.entity;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    private Integer transactionId;
    private Integer accountId;
    private String transactionType;
    private BigDecimal transactionAmount;
    private Integer accountIdDestination;
    private String logs;
    private LocalDateTime transactionTime;
}

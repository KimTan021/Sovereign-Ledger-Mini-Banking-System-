package com.sovereign_ledger.dto.request;

import lombok.*;

import java.math.BigDecimal;


@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TransactionLogRequestDTO {
    private Integer sourceAccountId;
    private String transactionType;
    private BigDecimal transactionAmount;
    private Integer targetAccountId;
    private String logs;
    private String transactionDescription;
    private String transactionStatus;
}
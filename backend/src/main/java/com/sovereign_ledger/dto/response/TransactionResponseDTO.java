package com.sovereign_ledger.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TransactionResponseDTO {
    private Integer transactionId;
    private Integer accountId;
    private String transactionType;
    private BigDecimal transactionAmount;
    private Integer accountIdDestination;
    private String logs;
    private LocalDateTime transactionTime;
    private String transactionDescription;
    private String transactionStatus;
}

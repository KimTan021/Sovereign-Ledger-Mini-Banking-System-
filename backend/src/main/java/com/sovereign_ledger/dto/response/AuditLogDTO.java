package com.sovereign_ledger.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {
    private Integer transactionId;
    private Integer accountId;
    private Integer userId;
    private String userName;
    private String accountNumber;
    private String title;
    private String detail;
    private BigDecimal amount;
    private String type; // e.g. "debit", "credit"
    private String status;
    private String reviewNote;
    private boolean error;
    private LocalDateTime timestamp;
}

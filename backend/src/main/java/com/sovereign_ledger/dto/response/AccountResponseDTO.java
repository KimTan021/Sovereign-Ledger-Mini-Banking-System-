package com.sovereign_ledger.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AccountResponseDTO {
    private Integer accountId;
    private Integer userId;
    private String accountNumber;
    private String accountType;
    private BigDecimal accountBalance;
    private String accountStatus;
}
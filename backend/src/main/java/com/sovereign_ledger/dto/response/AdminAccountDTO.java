package com.sovereign_ledger.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminAccountDTO {
    private Integer accountId;
    private String accountNumber;
    private String accountType;
    private BigDecimal accountBalance;
    private String accountStatus;
}

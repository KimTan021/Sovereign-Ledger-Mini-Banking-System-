package com.sovereign_ledger.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CashTransactionRequestDTO {
    private Integer accountId;
    private BigDecimal transAmount;
    private String description;
}

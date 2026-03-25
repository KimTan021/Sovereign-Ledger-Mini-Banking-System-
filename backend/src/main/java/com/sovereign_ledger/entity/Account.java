package com.sovereign_ledger.entity;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Account {
    private Integer accountId;
    private Integer userId;
    private String accountNumber;
    private String accountType;
    private BigDecimal accountBalance;
}
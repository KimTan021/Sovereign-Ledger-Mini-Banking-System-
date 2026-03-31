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
public class TopTransactorDTO {
    private Integer id;
    private String label;
    private BigDecimal totalAmount;
    private Integer transactionCount;
}

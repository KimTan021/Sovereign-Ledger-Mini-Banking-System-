package com.sovereign_ledger.dto.request;

import com.sovereign_ledger.entity.Account;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequestDTO {
    private Integer sourceAccountId;
    private Integer receivingAccountId;
    private BigDecimal transAmount;
    private String logs;
    private String transactionDescription;
}

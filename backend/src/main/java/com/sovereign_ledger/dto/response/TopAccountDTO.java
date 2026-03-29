package com.sovereign_ledger.dto.response;

import java.math.BigDecimal;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TopAccountDTO {
    private Integer userId;
    private String firstName;
    private String lastName;
    private BigDecimal accountBalance;

}

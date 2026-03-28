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
public class AdminStatsDTO {
    private BigDecimal totalLiquidity;
    private Integer dailyVolume;
    private Integer activeEntities;
}

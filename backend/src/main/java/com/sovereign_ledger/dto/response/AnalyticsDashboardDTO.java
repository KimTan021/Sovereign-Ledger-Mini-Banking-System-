package com.sovereign_ledger.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDashboardDTO {
    private List<CategoryMetricDTO> dailyVolume;
    private List<CategoryMetricDTO> transactionDistribution;
    private List<CategoryMetricDTO> volumeByAmount;
    private List<CategoryMetricDTO> accountGrowth;
    private List<CategoryMetricDTO> flaggedTrend;
    private List<CategoryMetricDTO> netFlow;
    private List<CategoryMetricDTO> approvalAging;
    private List<CategoryMetricDTO> accountStatusBreakdown;
    private List<CategoryMetricDTO> userStatusBreakdown;
    private List<CategoryMetricDTO> adjustmentAnalytics;
    private List<CategoryMetricDTO> complianceReviewAnalytics;
    private List<TopTransactorDTO> topUserTransactors;
    private List<TopTransactorDTO> topAccountTransactors;
}

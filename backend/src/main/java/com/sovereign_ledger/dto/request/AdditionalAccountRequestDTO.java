package com.sovereign_ledger.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdditionalAccountRequestDTO {
    private String requestAccountType;
}
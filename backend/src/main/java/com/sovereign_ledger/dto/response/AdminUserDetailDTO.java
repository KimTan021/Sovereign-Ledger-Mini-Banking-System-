package com.sovereign_ledger.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDetailDTO {
    private Integer userId;
    private String firstName;
    private String middleName;
    private String lastName;
    private String userEmail;
    private String phone;
    private String role;
    private String userStatus;
    private BigDecimal totalBalance;
    private List<AdminAccountDTO> accounts;
}

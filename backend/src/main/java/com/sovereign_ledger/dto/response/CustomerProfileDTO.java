package com.sovereign_ledger.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfileDTO {
    private Integer userId;
    private String firstName;
    private String middleName;
    private String lastName;
    private String userEmail;
    private String phone;
    private String userStatus;
}

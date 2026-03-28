package com.sovereign_ledger.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserProfileUpdateRequestDTO {
    private String firstName;
    private String middleName;
    private String lastName;
    private String userEmail;
    private String phone;
}

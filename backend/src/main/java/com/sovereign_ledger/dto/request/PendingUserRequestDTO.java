package com.sovereign_ledger.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class PendingUserRequestDTO {

    private String firstName;
    private String middleName;
    private String lastName;
    private String userEmail;
    private String password;
    private String requestAccountType;
    private String phone;
    private BigDecimal initialDeposit;

    public PendingUserRequestDTO() {}

    public PendingUserRequestDTO(String firstName, String middleName, String lastName, String userEmail, String password, String requestAccountType, String phone, BigDecimal initialDeposit) {
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.userEmail = userEmail;
        this.password = password;
        this.requestAccountType = requestAccountType;
        this.phone = phone;
        this.initialDeposit = initialDeposit;
    }
}

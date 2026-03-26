package com.sovereign_ledger.entity;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Integer userId;
    private String firstName;
    private String lastName;
    private String middleName;
    private String userEmail;
    private String password;
    private String Role;

}
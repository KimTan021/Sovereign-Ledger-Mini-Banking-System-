package com.sovereign_ledger.dto.response;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
public class LoginResponseDTO {

    private String token;
    private Integer userId;
    private String userName;
    private String userEmail;
    private String role;

    public LoginResponseDTO() {}

    public LoginResponseDTO(String token, Integer userId, String userName, String userEmail, String role) {
        this.token = token;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.role = role;
    }
}

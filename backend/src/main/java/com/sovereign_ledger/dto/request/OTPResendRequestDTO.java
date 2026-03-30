package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OTPResendRequestDTO {

    @NotBlank(message = "Email is required.")
    @Email(message = "Email must be valid.")
    private String email;
}
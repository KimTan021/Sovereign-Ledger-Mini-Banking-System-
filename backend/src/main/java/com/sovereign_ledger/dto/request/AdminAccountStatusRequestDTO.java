package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminAccountStatusRequestDTO {
    @NotBlank(message = "Account status is required.")
    @Pattern(regexp = "^(?i)(verified|frozen|closed)$", message = "Account status must be Verified, Frozen, or Closed.")
    private String status;
}

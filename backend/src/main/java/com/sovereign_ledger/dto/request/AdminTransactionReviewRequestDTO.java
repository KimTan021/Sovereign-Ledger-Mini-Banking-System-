package com.sovereign_ledger.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminTransactionReviewRequestDTO {
    @NotBlank(message = "Review status is required.")
    @Pattern(regexp = "^(?i)(reviewed|escalated|review required|completed|failed)$", message = "Review status is invalid.")
    private String status;

    @Size(max = 250, message = "Review note must not exceed 250 characters.")
    private String note;
}

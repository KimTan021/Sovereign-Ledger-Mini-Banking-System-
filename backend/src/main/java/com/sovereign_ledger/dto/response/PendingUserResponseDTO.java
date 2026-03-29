package com.sovereign_ledger.dto.response;

import com.sovereign_ledger.entity.PendingUser;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PendingUserResponseDTO {

    private Integer userId;
    private String firstName;
    private String middleName;
    private String lastName;
    private String userEmail;
    private String requestAccountType;
    private String phone;
    private BigDecimal initialDeposit;
    private LocalDateTime requestTime;
    private String requestStatus;
    private LocalDateTime reviewedAt;

    public static PendingUserResponseDTO fromEntity(PendingUser pendingUser) {
        PendingUserResponseDTO dto = new PendingUserResponseDTO();
        dto.setUserId(pendingUser.getUserId());
        dto.setFirstName(pendingUser.getFirstName());
        dto.setMiddleName(pendingUser.getMiddleName());
        dto.setLastName(pendingUser.getLastName());
        dto.setUserEmail(pendingUser.getUserEmail());
        dto.setRequestAccountType(pendingUser.getRequestAccountType());
        dto.setPhone(pendingUser.getPhone());
        dto.setInitialDeposit(pendingUser.getInitialDeposit());
        dto.setRequestTime(pendingUser.getRequestTime());
        dto.setRequestStatus(pendingUser.getRequestStatus());
        dto.setReviewedAt(pendingUser.getReviewedAt());
        return dto;
    }
}

package com.sovereign_ledger.dto.response;

import com.sovereign_ledger.entity.PendingUser;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

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
    private LocalDateTime requestTime;

    public static PendingUserResponseDTO fromEntity(PendingUser pendingUser) {
        PendingUserResponseDTO dto = new PendingUserResponseDTO();
        dto.setUserId(pendingUser.getUserId());
        dto.setFirstName(pendingUser.getFirstName());
        dto.setMiddleName(pendingUser.getMiddleName());
        dto.setLastName(pendingUser.getLastName());
        dto.setUserEmail(pendingUser.getUserEmail());
        dto.setRequestAccountType(pendingUser.getRequestAccountType());
        dto.setRequestTime(pendingUser.getRequestTime());
        return dto;
    }
}

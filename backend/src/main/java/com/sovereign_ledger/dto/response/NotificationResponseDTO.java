package com.sovereign_ledger.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {
    private Integer notificationId;
    private Integer userId;
    private Integer accountId;
    private Integer transactionId;
    private String notificationType;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}

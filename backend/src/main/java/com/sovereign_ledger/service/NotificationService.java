package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.response.NotificationResponseDTO;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

public interface NotificationService {
    List<NotificationResponseDTO> getNotificationsForUser(String userEmail);
    NotificationResponseDTO markAsRead(Integer notificationId, String userEmail);
    NotificationResponseDTO createNotification(Integer userId,
                                               Integer accountId,
                                               Integer transactionId,
                                               String type,
                                               String title,
                                               String message);
    SseEmitter registerEmitter(Integer userId);
    void emitDataChange(String... domains);
}

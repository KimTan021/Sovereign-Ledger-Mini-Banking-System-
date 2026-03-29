package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.response.NotificationResponseDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.entity.Notification;
import com.sovereign_ledger.entity.Transaction;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.repository.AccountRepository;
import com.sovereign_ledger.repository.NotificationRepository;
import com.sovereign_ledger.repository.TransactionRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Transactional(readOnly = true)
public class NotificationServiceImplementation implements NotificationService {
    private static final long SSE_TIMEOUT_MS = 30L * 60L * 1000L;

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final Map<Integer, CopyOnWriteArrayList<SseEmitter>> emittersByUser = new ConcurrentHashMap<>();

    public NotificationServiceImplementation(NotificationRepository notificationRepository,
                                             UserRepository userRepository,
                                             AccountRepository accountRepository,
                                             TransactionRepository transactionRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public List<NotificationResponseDTO> getNotificationsForUser(String userEmail) {
        User user = findUser(userEmail);
        return notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(user.getUserId()).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public NotificationResponseDTO markAsRead(Integer notificationId, String userEmail) {
        User user = findUser(userEmail);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found."));
        if (!notification.getUser().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("Notification does not belong to this user.");
        }
        notification.setIsRead(true);
        return toDto(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public NotificationResponseDTO createNotification(Integer userId,
                                                      Integer accountId,
                                                      Integer transactionId,
                                                      String type,
                                                      String title,
                                                      String message) {
        Notification notification = new Notification();
        notification.setUser(userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found.")));
        notification.setAccount(accountId == null ? null : accountRepository.findById(accountId).orElse(null));
        notification.setTransaction(transactionId == null ? null : transactionRepository.findById(transactionId).orElse(null));
        notification.setNotificationType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        NotificationResponseDTO dto = toDto(notificationRepository.save(notification));
        emit(dto);
        return dto;
    }

    @Override
    public SseEmitter registerEmitter(Integer userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        emittersByUser.computeIfAbsent(userId, ignored -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(error -> removeEmitter(userId, emitter));

        try {
            emitter.send(SseEmitter.event().name("connected").data("notifications-connected"));
        } catch (IOException e) {
            emitter.complete();
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    @Override
    public void emitDataChange(String... domains) {
        Map<String, Object> payload = Map.of(
                "domains", Arrays.stream(domains)
                        .filter(domain -> domain != null && !domain.isBlank())
                        .distinct()
                        .toList(),
                "timestamp", LocalDateTime.now().toString()
        );

        emittersByUser.forEach((userId, emitters) -> emitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event().name("data-change").data(payload));
            } catch (IOException e) {
                emitter.complete();
                removeEmitter(userId, emitter);
            }
        }));
    }

    private void emit(NotificationResponseDTO dto) {
        CopyOnWriteArrayList<SseEmitter> emitters = emittersByUser.get(dto.getUserId());
        if (emitters == null) {
            return;
        }
        emitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event().name("notification").data(dto));
            } catch (IOException e) {
                emitter.complete();
                removeEmitter(dto.getUserId(), emitter);
            }
        });
    }

    private void removeEmitter(Integer userId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = emittersByUser.get(userId);
        if (emitters == null) {
            return;
        }
        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            emittersByUser.remove(userId);
        }
    }

    private User findUser(String userEmail) {
        return userRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }

    private NotificationResponseDTO toDto(Notification notification) {
        return new NotificationResponseDTO(
                notification.getNotificationId(),
                notification.getUser().getUserId(),
                notification.getAccount() == null ? null : notification.getAccount().getAccountId(),
                notification.getTransaction() == null ? null : notification.getTransaction().getTransactionId(),
                notification.getNotificationType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getIsRead(),
                notification.getCreatedAt()
        );
    }
}

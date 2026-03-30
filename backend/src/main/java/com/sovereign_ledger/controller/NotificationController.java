package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.response.NotificationResponseDTO;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.security.JwtUtil;
import com.sovereign_ledger.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, JwtUtil jwtUtil, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userDetails.getUsername()));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(@PathVariable Integer notificationId,
                                                              @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId, userDetails.getUsername()));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam("token") String token) {
        String userEmail = jwtUtil.extractUserEmail(token);
        if (!jwtUtil.validateToken(token, userEmail)) {
            throw new IllegalArgumentException("Invalid notification stream token.");
        }
        User user = userRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        if (!"ACTIVE".equalsIgnoreCase(user.getUserStatus())) {
            throw new IllegalArgumentException("Notification stream is unavailable for suspended users.");
        }
        return notificationService.registerEmitter(user.getUserId());
    }
}


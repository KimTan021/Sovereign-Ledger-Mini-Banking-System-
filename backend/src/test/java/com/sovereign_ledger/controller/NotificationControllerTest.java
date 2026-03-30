package com.sovereign_ledger.controller;

import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.security.JwtUtil;
import com.sovereign_ledger.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@SpringBootTest
@AutoConfigureMockMvc
public class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private NotificationService notificationService;

    @Test
    @WithMockUser
    public void testStreamWithInvalidToken() throws Exception {
        when(jwtUtil.extractUserEmail(anyString())).thenReturn("test@example.com");
        when(jwtUtil.validateToken(anyString(), anyString())).thenReturn(false);

        mockMvc.perform(get("/notifications/stream")
                .param("token", "invalid-token")
                .accept(MediaType.TEXT_EVENT_STREAM))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid notification stream token."));
    }

    @Test
    @WithMockUser
    public void testStreamWithSuspendedUser() throws Exception {
        String email = "suspended@example.com";
        User user = new User();
        user.setUserEmail(email);
        user.setUserStatus("SUSPENDED");

        when(jwtUtil.extractUserEmail(anyString())).thenReturn(email);
        when(jwtUtil.validateToken(anyString(), anyString())).thenReturn(true);
        when(userRepository.findByUserEmail(email)).thenReturn(Optional.of(user));

        mockMvc.perform(get("/notifications/stream")
                .param("token", "valid-token")
                .accept(MediaType.TEXT_EVENT_STREAM))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Notification stream is unavailable for suspended users."));
    }
}

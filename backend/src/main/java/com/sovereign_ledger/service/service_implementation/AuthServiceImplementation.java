package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.request.LoginRequestDTO;
import com.sovereign_ledger.dto.response.LoginResponseDTO;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.exception.exception_classes.UserNotFoundException;
import com.sovereign_ledger.repository.PendingUserRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.security.JwtUtil;
import com.sovereign_ledger.service.AuthService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImplementation implements AuthService {

    private final UserRepository userRepository;
    private final PendingUserRepository pendingUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImplementation(UserRepository userRepository,
                                     PendingUserRepository pendingUserRepository,
                                     BCryptPasswordEncoder passwordEncoder,
                                     JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.pendingUserRepository = pendingUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public LoginResponseDTO login (LoginRequestDTO request) {

        if(request.getUserEmail() == null || request.getUserEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email required");
        }

        if(request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password required");
        }

        User existingUser = userRepository.findByUserEmail(request.getUserEmail()).orElse(null);

        if (existingUser == null) {
            handleMissingUser(request.getUserEmail());
        }

        if (!"ACTIVE".equalsIgnoreCase(existingUser.getUserStatus())) {
            throw new IllegalArgumentException("User access is currently suspended");
        }

        if(!passwordEncoder.matches(request.getPassword(), existingUser.getPassword())) {
            throw new IllegalArgumentException("Password Incorrect");
        }

        String token = jwtUtil.generateToken(existingUser.getUserEmail(), existingUser.getRole().toUpperCase());

        return new LoginResponseDTO(
                token, 
                existingUser.getUserId(), 
                existingUser.getFirstName() + " " + existingUser.getLastName(),
                existingUser.getUserEmail(), 
                existingUser.getRole().toLowerCase()
        );
    }

    private void handleMissingUser(String email) {
        var pendingRequests = pendingUserRepository.findByUserEmailOrderByRequestTimeDesc(email);

        if (pendingRequests.isEmpty()) {
            throw new UserNotFoundException("User not found");
        }

        var latestRequest = pendingRequests.get(0);
        String status = latestRequest.getRequestStatus();

        if ("Pending_OTP".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Institutional authorization incomplete. Please verify your identity using the code dispatched to your email.");
        }

        if ("Pending".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Your application is currently undergoing mandatory institutional review. Access is restricted until authorized.");
        }

        if ("Rejected".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("The application associated with this identity was declined after official review.");
        }

        // Default fallback if some other status exists
        throw new UserNotFoundException("User not found");
    }
}

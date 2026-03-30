package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.request.LoginRequestDTO;
import com.sovereign_ledger.dto.response.LoginResponseDTO;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.exception.exception_classes.UserNotFoundException;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.security.JwtUtil;
import com.sovereign_ledger.service.AuthService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImplementation implements AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthServiceImplementation(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
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

      User existingUser = userRepository.findByUserEmail(request.getUserEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

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
}

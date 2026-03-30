package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.request.CustomerPasswordChangeRequestDTO;
import com.sovereign_ledger.dto.request.CustomerProfileUpdateRequestDTO;
import com.sovereign_ledger.dto.response.CustomerProfileDTO;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.exception.exception_classes.UserNotFoundException;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer/profile")
public class CustomerController {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public CustomerController(UserRepository userRepository,
                              BCryptPasswordEncoder passwordEncoder,
                              NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<CustomerProfileDTO> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = findUser(userDetails.getUsername());
        return ResponseEntity.ok(toCustomerProfileDTO(user));
    }

    @PutMapping
    public ResponseEntity<CustomerProfileDTO> updateProfile(@Valid @RequestBody CustomerProfileUpdateRequestDTO request,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = findUser(userDetails.getUsername());
        user.setFirstName(request.getFirstName());
        user.setMiddleName(request.getMiddleName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        CustomerProfileDTO response = toCustomerProfileDTO(userRepository.save(user));
        notificationService.emitDataChange("users", "customer-profile", "admin");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody CustomerPasswordChangeRequestDTO request,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = findUser(userDetails.getUsername());
        if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters.");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        userRepository.save(user);
        notificationService.emitDataChange("users", "customer-profile", "admin");
        return ResponseEntity.ok("Password updated successfully.");
    }

    private User findUser(String userEmail) {
        return userRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private CustomerProfileDTO toCustomerProfileDTO(User user) {
        return new CustomerProfileDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getMiddleName(),
                user.getLastName(),
                user.getUserEmail(),
                user.getPhone(),
                user.getUserStatus()
        );
    }
}

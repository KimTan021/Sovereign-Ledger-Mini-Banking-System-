package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.request.CustomerPasswordChangeRequestDTO;
import com.sovereign_ledger.dto.request.CustomerProfileUpdateRequestDTO;
import com.sovereign_ledger.dto.response.CustomerProfileDTO;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.exception.exception_classes.UserNotFoundException;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.CustomerService;
import com.sovereign_ledger.service.NotificationService;
import com.sovereign_ledger.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@Service
public class CustomerServiceImplementation implements CustomerService {
    private final UserRepository userRepository;
    private final UserService userService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public CustomerServiceImplementation(UserRepository userRepository,
                              UserService userService,
                              BCryptPasswordEncoder passwordEncoder,
                              NotificationService notificationService) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
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

    @Override
    public ResponseEntity<CustomerProfileDTO> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(toCustomerProfileDTO(userService.findUserByEmail(userDetails.getUsername())));
    }

    @Override
    public ResponseEntity<CustomerProfileDTO> updateProfile(@Valid @RequestBody CustomerProfileUpdateRequestDTO request,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findUserByEmail(userDetails.getUsername());
        user.setFirstName(request.getFirstName());
        user.setMiddleName(request.getMiddleName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        CustomerProfileDTO response = toCustomerProfileDTO(userRepository.save(user));
        notificationService.emitDataChange("users", "customer-profile", "admin");
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<String> changePassword(@Valid @RequestBody CustomerPasswordChangeRequestDTO request,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findUserByEmail(userDetails.getUsername());
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
}

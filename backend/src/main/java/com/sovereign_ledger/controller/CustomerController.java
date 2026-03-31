package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.request.CustomerPasswordChangeRequestDTO;
import com.sovereign_ledger.dto.request.CustomerProfileUpdateRequestDTO;
import com.sovereign_ledger.dto.response.CustomerProfileDTO;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.CustomerService;
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
    private final CustomerService customerService;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public CustomerController(CustomerService customerService,
                              UserRepository userRepository,
                              BCryptPasswordEncoder passwordEncoder,
                              NotificationService notificationService) {
        this.customerService = customerService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<CustomerProfileDTO> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return customerService.getProfile(userDetails);
    }

    @PutMapping
    public ResponseEntity<CustomerProfileDTO> updateProfile(@Valid @RequestBody CustomerProfileUpdateRequestDTO request,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        return customerService.updateProfile(request, userDetails);
    }

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody CustomerPasswordChangeRequestDTO request,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        return customerService.changePassword(request, userDetails);
    }
}

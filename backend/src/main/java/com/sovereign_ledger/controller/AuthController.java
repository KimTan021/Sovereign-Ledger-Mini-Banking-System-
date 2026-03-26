package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.request.LoginRequestDTO;
import com.sovereign_ledger.dto.response.LoginResponseDTO;
import com.sovereign_ledger.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login (@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }
}

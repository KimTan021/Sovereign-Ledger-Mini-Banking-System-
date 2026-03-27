package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.response.UserApprovalResponseDTO;
import com.sovereign_ledger.dto.response.PendingUserResponseDTO;
import com.sovereign_ledger.dto.response.UserResponseDTO;
import com.sovereign_ledger.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> findAllUsers() {
        return ResponseEntity.ok(adminService.findAllUsers());
    }

    @GetMapping("/pending-users")
    public ResponseEntity<List<PendingUserResponseDTO>> findAllPendingUsers() {
        return ResponseEntity.ok(adminService.findAllPendingUsers());
    }

    @PutMapping("/pending-users/{id}/approve")
    public ResponseEntity<UserApprovalResponseDTO> approvePendingUser(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.approvePendingUser(id));
    }

    @DeleteMapping("/pending-users/{id}/reject")
    public ResponseEntity<Void> rejectPendingUser(@PathVariable Integer id) {
        adminService.rejectPendingUser(id);
        return ResponseEntity.noContent().build();
    }
}
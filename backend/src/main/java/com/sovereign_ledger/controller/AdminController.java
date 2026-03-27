package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.response.UserApprovalResponseDTO;
import com.sovereign_ledger.dto.response.PendingUserResponseDTO;
import com.sovereign_ledger.dto.response.UserResponseDTO;
import com.sovereign_ledger.entity.PendingUser;
import com.sovereign_ledger.repository.PendingUserRepository;
import com.sovereign_ledger.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    private final PendingUserRepository pendingUserRepository;

    public AdminController(AdminService adminService, PendingUserRepository pendingUserRepository) {
        this.adminService = adminService;
        this.pendingUserRepository = pendingUserRepository;
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


    @PostMapping("/seed/approve-all")
    public ResponseEntity<Map<String, Object>> approveAllPendingUsers() {
        List<PendingUser> pending = pendingUserRepository.findAll(); // lowercase

        if (pending.isEmpty()) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "skipped");
            response.put("message", "No pending users found.");
            return ResponseEntity.badRequest().body(response);
        }

        List<UserApprovalResponseDTO> approved = pending.stream()
                .map(p -> adminService.approvePendingUser(p.getUserId())) // through service
                .collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        response.put("message", approved.size() + " pending users approved and accounts created.");
        response.put("approved_users", approved);
        return ResponseEntity.ok(response);
    }
}
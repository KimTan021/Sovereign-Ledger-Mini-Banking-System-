package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.request.PendingUserRequestDTO;
import com.sovereign_ledger.dto.response.PendingUserResponseDTO;
import com.sovereign_ledger.entity.PendingUser;
import com.sovereign_ledger.service.PendingUserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pending-user")
public class PendingUserController {
    private final PendingUserService pendingUserService;

    public PendingUserController(PendingUserService pendingUserService) {
        this.pendingUserService = pendingUserService;
    }

    @PostMapping("/register")
    public PendingUserResponseDTO savePendingUser(@RequestBody PendingUserRequestDTO dto){
        return pendingUserService.savePendingUser(dto);
    }

}

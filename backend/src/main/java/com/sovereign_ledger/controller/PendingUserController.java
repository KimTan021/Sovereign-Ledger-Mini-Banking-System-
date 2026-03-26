package com.sovereign_ledger.controller;

import com.sovereign_ledger.entity.PendingUser;
import com.sovereign_ledger.service.PendingUserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pending-user")
public class PendingUserController {
    private final PendingUserService pendingUserService;

    public PendingUserController(PendingUserService pendingUserService){
        this.pendingUserService = pendingUserService;
    }

    @GetMapping
    public List<PendingUser> findAllPendingUsers(){
        return pendingUserService.findAllPendingUsers();
    }

    @GetMapping("/{id}")
    public PendingUser findPendingUserById(@PathVariable Integer id){
        return pendingUserService.findPendingUserById(id);
    }

    @PostMapping
    public PendingUser savePendingUser(@RequestBody PendingUser pendingUser){
        return pendingUserService.savePendingUser(pendingUser);
    }

    @DeleteMapping("/{id}")
    public void deletePendingUser(@PathVariable Integer id){
        pendingUserService.deletePendingUser(id);
    }
}

package com.sovereign_ledger.service;

import com.sovereign_ledger.entity.PendingUser;

import java.util.List;

public interface PendingUserService {
    List<PendingUser> findAllPendingUsers();
    PendingUser findPendingUserById(Integer id);
    PendingUser savePendingUser(PendingUser pendingUser);
    void deletePendingUser(Integer id);
}

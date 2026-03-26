package com.sovereign_ledger.service;

import com.sovereign_ledger.entity.User;

import java.util.List;

public interface UserService {
    List<User> findAllUsers();
    User findUserById(Integer id);
    User saveUser(User user);
    void deleteUser(Integer id);
}

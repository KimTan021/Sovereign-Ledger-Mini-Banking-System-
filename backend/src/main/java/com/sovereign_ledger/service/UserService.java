package com.sovereign_ledger.service;

import com.sovereign_ledger.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserService {
    List<User> findAllUsers();
    User findUserById(Integer id);
    User saveUser(User user);
    void deleteUser(Integer id);
}

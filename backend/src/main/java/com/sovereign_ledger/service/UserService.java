package com.sovereign_ledger.service;

import com.sovereign_ledger.dto.response.UserResponseDTO;
import com.sovereign_ledger.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;

public interface UserService {
    List<UserResponseDTO> findAllUsers();
    UserResponseDTO findUserById(Integer id);
    UserResponseDTO saveUser(User user);
    void deleteUser(Integer id);
}

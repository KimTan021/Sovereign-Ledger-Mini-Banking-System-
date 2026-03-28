package com.sovereign_ledger.controller;

import com.sovereign_ledger.dto.response.UserResponseDTO;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponseDTO> findAllUsers(){
        return userService.findAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponseDTO findUserById(@PathVariable Integer id){
        return userService.findUserById(id);
    }

    @PutMapping
    public UserResponseDTO saveUser(@RequestBody User user){
        return userService.saveUser(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Integer id){
        userService.deleteUser(id);
    }
}

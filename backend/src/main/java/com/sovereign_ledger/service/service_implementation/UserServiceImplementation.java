package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.UserService;

import java.util.List;

public class UserServiceImplementation implements UserService {
    private final UserRepository userRepository;

    public UserServiceImplementation(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public List<User> findAllUsers(){
        return userRepository.findAll();
    }

    public User findUserById(Integer id){
        return userRepository.findById(id).orElse(null);
    }

    public User saveUser(User user){
        return userRepository.save(user);
    }

    public void deleteUser(Integer id){
        userRepository.deleteById(id);
    }


}

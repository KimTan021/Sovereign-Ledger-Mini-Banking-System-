package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.response.AccountResponseDTO;
import com.sovereign_ledger.dto.response.UserResponseDTO;
import com.sovereign_ledger.entity.Account;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.UserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImplementation implements UserService {
    private final UserRepository userRepository;

    public UserServiceImplementation(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    private UserResponseDTO toUserResponseDTO(User user){
        return new UserResponseDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getMiddleName(),
                user.getLastName(),
                user.getUserEmail(),
                user.getRole()
        );
    }

    public List<UserResponseDTO> findAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(u -> toUserResponseDTO(u))
                .toList();
    }

    public UserResponseDTO findUserById(Integer id){
        User user =  userRepository.findById(id).orElse(null);
        return toUserResponseDTO(user);
    }

    public UserResponseDTO saveUser(User user){

        return toUserResponseDTO(userRepository.save(user));
    }

    public void deleteUser(Integer id){
        userRepository.deleteById(id);
    }


}

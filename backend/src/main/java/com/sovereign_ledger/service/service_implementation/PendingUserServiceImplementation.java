package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.request.AdditionalAccountRequestDTO;
import com.sovereign_ledger.dto.request.PendingUserRequestDTO;
import com.sovereign_ledger.dto.response.PendingUserResponseDTO;
import com.sovereign_ledger.entity.PendingUser;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.repository.PendingUserRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.PendingUserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PendingUserServiceImplementation implements PendingUserService {

    private final UserRepository userRepository;
    private final PendingUserRepository pendingUserRepository;
    private final PasswordEncoder passwordEncoder;

    public PendingUserServiceImplementation(UserRepository userRepository, PendingUserRepository pendingUserRepository, PasswordEncoder passwordEncoder){
        this.userRepository=userRepository;
        this.pendingUserRepository=pendingUserRepository;
        this.passwordEncoder=passwordEncoder;
    }

    @Override
    public PendingUserResponseDTO savePendingUser(PendingUserRequestDTO dto){

        if (pendingUserRepository.existsByUserEmail(dto.getUserEmail())) {
            throw new RuntimeException("Email already registered and pending approval");
        }

        if (userRepository.existsByUserEmail(dto.getUserEmail())){
            throw new RuntimeException("Email already used");
        }

        PendingUser pendingUser = new PendingUser();
        pendingUser.setFirstName(dto.getFirstName());
        pendingUser.setMiddleName(dto.getMiddleName());
        pendingUser.setLastName(dto.getLastName());
        pendingUser.setUserEmail(dto.getUserEmail());
        pendingUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        pendingUser.setRequestAccountType(dto.getRequestAccountType());
        pendingUser.setRequestTime(LocalDateTime.now());

        return PendingUserResponseDTO.fromEntity(pendingUserRepository.save(pendingUser));
    }

    @Override
    public PendingUserResponseDTO requestAdditionalAccount (AdditionalAccountRequestDTO dto, String userEmail) {

        // Fetch the currently logged in user
        User existingUser = userRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Populate pending_user with existing user's data
        PendingUser pendingUser = new PendingUser();
        pendingUser.setFirstName(existingUser.getFirstName());
        pendingUser.setMiddleName(existingUser.getMiddleName());
        pendingUser.setLastName(existingUser.getLastName());
        pendingUser.setUserEmail(existingUser.getUserEmail());
        pendingUser.setPassword(existingUser.getPassword());
        pendingUser.setRequestAccountType(dto.getRequestAccountType());
        pendingUser.setRequestTime(LocalDateTime.now());
        pendingUser.setExistingUser(existingUser); // sets the user_id foreign key

        PendingUser saved = pendingUserRepository.save(pendingUser);

        PendingUserResponseDTO response = new PendingUserResponseDTO();
        response.setUserId(saved.getUserId());
        response.setFirstName(saved.getFirstName());
        response.setMiddleName(saved.getMiddleName());
        response.setLastName(saved.getLastName());
        response.setUserEmail(saved.getUserEmail());
        response.setRequestAccountType(saved.getRequestAccountType());
        response.setRequestTime(saved.getRequestTime());
        return response;
    }
}

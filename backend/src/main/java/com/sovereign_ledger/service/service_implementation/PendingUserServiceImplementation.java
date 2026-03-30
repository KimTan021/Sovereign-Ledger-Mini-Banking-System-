package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.dto.request.AdditionalAccountRequestDTO;
import com.sovereign_ledger.dto.request.PendingUserRequestDTO;
import com.sovereign_ledger.dto.response.PendingUserResponseDTO;
import com.sovereign_ledger.entity.PendingUser;
import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.repository.PendingUserRepository;
import com.sovereign_ledger.repository.UserRepository;
import com.sovereign_ledger.service.NotificationService;
import com.sovereign_ledger.service.PendingUserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Service
public class PendingUserServiceImplementation implements PendingUserService {

    private final UserRepository userRepository;
    private final PendingUserRepository pendingUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public PendingUserServiceImplementation(UserRepository userRepository,
                                            PendingUserRepository pendingUserRepository,
                                            PasswordEncoder passwordEncoder,
                                            NotificationService notificationService){
        this.userRepository=userRepository;
        this.pendingUserRepository=pendingUserRepository;
        this.passwordEncoder=passwordEncoder;
        this.notificationService = notificationService;
    }

    @Override
    public PendingUserResponseDTO savePendingUser(PendingUserRequestDTO dto){

        if (pendingUserRepository.existsByUserEmailAndRequestStatusIgnoreCase(dto.getUserEmail(), "Pending")) {
            throw new RuntimeException("Email already registered and pending approval");
        }

        if (userRepository.existsByUserEmail(dto.getUserEmail())){
            throw new RuntimeException("Email already used");
        }

        // Normalize inputs to ensure robust matching
        String firstName = dto.getFirstName() != null ? dto.getFirstName().trim() : "";
        String middleName = dto.getMiddleName() != null ? dto.getMiddleName().trim() : "";
        String lastName = dto.getLastName() != null ? dto.getLastName().trim() : "";
        String phone = dto.getPhone() != null ? dto.getPhone().trim() : "";

        // Phone uniqueness check (Cross-table protection)
        if (pendingUserRepository.existsByPhoneAndRequestStatusIgnoreCase(phone, "Pending")) {
            throw new RuntimeException("This phone number is already associated with an active registration request.");
        }
        if (userRepository.existsByPhone(phone)) {
            throw new RuntimeException("This phone number is already linked to an existing profile. Please sign in to request additional ledger accounts.");
        }

        // Legal Name Safeguard (Institutional Duplicate Prevention)
        if (pendingUserRepository.existsByFirstNameIgnoreCaseAndMiddleNameIgnoreCaseAndLastNameIgnoreCaseAndRequestStatusIgnoreCase(
                firstName, middleName, lastName, "Pending")) {
            throw new RuntimeException("An identity with this legal name is already undergoing mandatory review. Multiple identity files are prohibited.");
        }
        if (userRepository.existsByFirstNameIgnoreCaseAndMiddleNameIgnoreCaseAndLastNameIgnoreCase(
                firstName, middleName, lastName)) {
            throw new RuntimeException("A verified legal identity with this name already exists in our network. To prevent profile duplication, please sign in to your existing account.");
        }

        PendingUser pendingUser = new PendingUser();
        pendingUser.setFirstName(dto.getFirstName());
        pendingUser.setMiddleName(dto.getMiddleName());
        pendingUser.setLastName(dto.getLastName());
        pendingUser.setUserEmail(dto.getUserEmail());
        pendingUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        pendingUser.setRequestAccountType(dto.getRequestAccountType());
        pendingUser.setRequestStatus("Pending");
        pendingUser.setReviewedAt(null);
        pendingUser.setPhone(dto.getPhone());
        pendingUser.setInitialDeposit(dto.getInitialDeposit());
        pendingUser.setRequestTime(LocalDateTime.now());
        pendingUser.setEmailStatus("Unconfirmed");

        PendingUserResponseDTO response = PendingUserResponseDTO.fromEntity(pendingUserRepository.save(pendingUser));
        notificationService.emitDataChange("pending-users", "admin");
        return response;
    }

    @Override
    public PendingUserResponseDTO requestAdditionalAccount (AdditionalAccountRequestDTO dto, String userEmail) {

        // Fetch the currently logged in user
        User existingUser = userRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (pendingUserRepository.existsByUserEmailAndRequestStatusIgnoreCase(existingUser.getUserEmail(), "Pending")) {
            throw new RuntimeException("You already have a pending account request under review.");
        }

        // Populate pending_user with existing user's data
        PendingUser pendingUser = new PendingUser();
        pendingUser.setFirstName(existingUser.getFirstName());
        pendingUser.setMiddleName(existingUser.getMiddleName());
        pendingUser.setLastName(existingUser.getLastName());
        pendingUser.setUserEmail(existingUser.getUserEmail());
        pendingUser.setPassword(existingUser.getPassword());
        pendingUser.setRequestAccountType(dto.getRequestAccountType());
        pendingUser.setRequestStatus("Pending");
        pendingUser.setReviewedAt(null);
        pendingUser.setInitialDeposit(dto.getInitialDeposit());
        pendingUser.setRequestTime(LocalDateTime.now());
        pendingUser.setExistingUser(existingUser); // sets the user_id foreign key
        pendingUser.setEmailStatus("Confirmed");

        PendingUser saved = pendingUserRepository.save(pendingUser);

        PendingUserResponseDTO response = new PendingUserResponseDTO();
        response.setUserId(saved.getUserId());
        response.setFirstName(saved.getFirstName());
        response.setMiddleName(saved.getMiddleName());
        response.setLastName(saved.getLastName());
        response.setUserEmail(saved.getUserEmail());
        response.setRequestAccountType(saved.getRequestAccountType());
        response.setInitialDeposit(saved.getInitialDeposit());
        response.setRequestTime(saved.getRequestTime());
        response.setRequestStatus(saved.getRequestStatus());
        response.setReviewedAt(saved.getReviewedAt());
        response.setEmailStatus(saved.getEmailStatus());
        notificationService.emitDataChange("pending-users", "admin");
        return response;
    }

    @Override
    public List<PendingUserResponseDTO> findRequestsForUser(String userEmail) {
        User existingUser = userRepository.findByUserEmail(userEmail).orElse(null);
        Stream<PendingUser> existingUserRequests = existingUser == null
                ? Stream.empty()
                : pendingUserRepository.findByExistingUser_UserIdOrderByRequestTimeDesc(existingUser.getUserId()).stream();
        Stream<PendingUser> emailRequests = pendingUserRepository.findByUserEmailOrderByRequestTimeDesc(userEmail).stream();

        Map<Integer, PendingUser> deduped = Stream.concat(existingUserRequests, emailRequests)
                .sorted((left, right) -> right.getRequestTime().compareTo(left.getRequestTime()))
                .collect(LinkedHashMap::new, (acc, request) -> acc.putIfAbsent(request.getUserId(), request), Map::putAll);

        return deduped.values().stream()
                .map(PendingUserResponseDTO::fromEntity)
                .toList();
    }
}

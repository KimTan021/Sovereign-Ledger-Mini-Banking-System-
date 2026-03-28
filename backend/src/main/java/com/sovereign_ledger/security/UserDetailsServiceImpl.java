package com.sovereign_ledger.security;

import com.sovereign_ledger.entity.User;
import com.sovereign_ledger.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override

    // loadUserByUsername - Spring Security method DON'T CHANGE
    public UserDetails loadUserByUsername(String userEmail)
            throws UsernameNotFoundException {

        // Find user by email in DB
        User user = userRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with email: " + userEmail
                ));

        if (!"ACTIVE".equalsIgnoreCase(user.getUserStatus())) {
            throw new DisabledException("User access is currently suspended");
        }

        // ROLE_ prefix required by Spring Security
        // "CUSTOMER" becomes "ROLE_CUSTOMER" to match hasRole("CUSTOMER") in SecurityConfig
        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase());

        // Return Spring's UserDetails object — NOT your User entity
        // getUsername() on this object will return the email we pass here
        return new org.springframework.security.core.userdetails.User(
                user.getUserEmail(),        // this becomes what getUsername() returns
                user.getPassword(),
                Collections.singletonList(authority)
        );
    }
}

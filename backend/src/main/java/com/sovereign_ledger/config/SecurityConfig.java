package com.sovereign_ledger.config;

import com.sovereign_ledger.security.JwtAuthFilter;
import com.sovereign_ledger.security.UserDetailsServiceImpl;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, UserDetailsServiceImpl userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http

            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                // Public endpoints (no auth required)
                .requestMatchers("/auth/login", "/pending-user/apply", "/pending-user/verify-otp", "/pending-user/resend-otp").permitAll()
                .requestMatchers("/error/**").permitAll()

                // Specific Customer Transaction endpoints
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/transactions/transfer").hasAnyRole("USER", "ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/transactions/transfer-transaction").hasAnyRole("USER", "ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/transactions/deposit").hasAnyRole("USER", "ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/transactions/withdraw").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/transactions/*/transactions").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/accounts/*/accounts/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/accounts/*/accounts").hasAnyRole("USER", "ADMIN")

                // Customer Profile endpoints
                .requestMatchers("/pending-user/request-account").hasRole("USER")
                .requestMatchers("/pending-user/my-requests").hasRole("USER")
                .requestMatchers("/customer/profile/**").hasRole("USER")
                .requestMatchers("/notifications/stream").permitAll()
                .requestMatchers("/notifications/**").hasRole("USER")

                // Broad restrictions (Admin-only)
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/admin/users/**").hasRole("SUPER_ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/admin/users/*/role").hasRole("SUPER_ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/admin/admin-accounts").hasRole("SUPER_ADMIN")
                .requestMatchers("/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/seed").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/accounts/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/transactions/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                .anyRequest().authenticated()
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) ->
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, authException.getMessage())
                )
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()));

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public org.springframework.security.authentication.dao.DaoAuthenticationProvider authenticationProvider() {
        org.springframework.security.authentication.dao.DaoAuthenticationProvider authProvider =
                new org.springframework.security.authentication.dao.DaoAuthenticationProvider(userDetailsService);

        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of("http://localhost:4200"));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

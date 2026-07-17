package com.facile.auth_user_service.config;

import com.facile.auth_user_service.model.Role;
import com.facile.auth_user_service.model.User;
import com.facile.auth_user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class PlatformCredentialInitializer implements CommandLineRunner {
    private static final String OLD_ADMIN = "admin@facile.com";
    private static final String NEW_ADMIN = "facile.admin@gmail.com";
    private static final String OLD_SELLER = "jewelmars@gmail.com";
    private static final String NEW_SELLER = "facile.seller@gmail.com";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        upsertCredential(OLD_ADMIN, NEW_ADMIN, "Facile Admin", "Facile@admin26", Role.ADMIN);
        upsertCredential(OLD_SELLER, NEW_SELLER, "Facile Seller", "Facile@seller26", Role.SELLER);
    }

    private void upsertCredential(String oldEmail, String email, String name, String password, Role role) {
        User user = userRepository.findByEmail(email).orElse(null);
        User oldUser = userRepository.findByEmail(oldEmail).orElse(null);
        if (user == null) {
            user = oldUser != null ? oldUser : new User();
        } else if (oldUser != null && !oldUser.getId().equals(user.getId())) {
            oldUser.setEnabled(false);
            oldUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            userRepository.save(oldUser);
        }
        user.setEmail(email);
        user.setName(name);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEnabled(true);
        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        userRepository.save(user);
    }
}

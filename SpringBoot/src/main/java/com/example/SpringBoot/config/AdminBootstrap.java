package com.example.SpringBoot.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.SpringBoot.domain.Roles;
import com.example.SpringBoot.domain.User;
import com.example.SpringBoot.repository.UserRepository;

/**
 * Admin accounts can no longer be created through the public sign-up form.
 * Set ADMIN_EMAIL / ADMIN_PASSWORD to create the first one at startup.
 */
@Component
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final String email;
    private final String password;

    public AdminBootstrap(UserRepository users, PasswordEncoder encoder,
            @Value("${app.admin.email:}") String email, @Value("${app.admin.password:}") String password) {
        this.users = users;
        this.encoder = encoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (email.isBlank() || password.isBlank()) {
            return;
        }
        if (users.existsByEmailIgnoreCase(email.trim())) {
            return;
        }
        if (password.length() < 12) {
            log.error("ADMIN_PASSWORD must contain at least 12 characters: admin account not created.");
            return;
        }
        User admin = new User();
        admin.setName("Administrateur");
        admin.setLastName("");
        admin.setEmail(email.trim().toLowerCase());
        admin.setStatus(Roles.ADMIN);
        admin.setPassword(encoder.encode(password));
        admin.setActif(true);
        users.save(admin);
        log.info("Admin account created for {}", admin.getEmail());
    }
}

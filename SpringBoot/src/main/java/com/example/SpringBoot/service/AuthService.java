package com.example.SpringBoot.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.SpringBoot.domain.Roles;
import com.example.SpringBoot.domain.User;
import com.example.SpringBoot.domain.Validation;
import com.example.SpringBoot.dto.Dtos.ActivationRequest;
import com.example.SpringBoot.dto.Dtos.LoginRequest;
import com.example.SpringBoot.dto.Dtos.LoginResponse;
import com.example.SpringBoot.dto.Dtos.RegisterRequest;
import com.example.SpringBoot.repository.UserRepository;
import com.example.SpringBoot.repository.ValidationRepository;
import com.example.SpringBoot.security.JwtService;
import com.example.SpringBoot.web.ApiException;

@Service
public class AuthService {

    private static final Duration CODE_TTL = Duration.ofMinutes(10);
    private static final int MAX_CODE_ATTEMPTS = 5;
    private static final String INVALID_CODE = "Code invalide ou expiré";
    private static final String BAD_CREDENTIALS = "Email ou mot de passe incorrect";

    private final SecureRandom random = new SecureRandom();
    private final UserRepository users;
    private final ValidationRepository validations;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final NotificationService notifications;
    /** Used to spend the same time whether or not the e-mail exists (user enumeration). */
    private final String dummyHash;

    public AuthService(UserRepository users, ValidationRepository validations, PasswordEncoder encoder,
            JwtService jwt, NotificationService notifications) {
        this.users = users;
        this.validations = validations;
        this.encoder = encoder;
        this.jwt = jwt;
        this.notifications = notifications;
        this.dummyHash = encoder.encode("dummy-password-for-timing");
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional
    public void register(RegisterRequest req) {
        String email = normalize(req.email());
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet e-mail");
        }
        User user = new User();
        user.setName(req.name().trim());
        user.setLastName(req.lastName() == null ? "" : req.lastName().trim());
        user.setEmail(email);
        // Role and activation are decided by the server, never by the client.
        user.setStatus(Roles.AUTHOR);
        user.setActif(false);
        user.setPassword(encoder.encode(req.password()));
        users.save(user);
        issueCode(user);
    }

    /** Sends a new code. Always succeeds silently so it cannot reveal which e-mails exist. */
    @Transactional
    public void resendCode(String email) {
        users.findFirstByEmailIgnoreCase(normalize(email))
                .filter(u -> !u.isActif())
                .ifPresent(this::issueCode);
    }

    private void issueCode(User user) {
        validations.deleteByUser(user);
        Validation v = new Validation();
        Instant now = Instant.now();
        v.setCreation(now);
        v.setExpiration(now.plus(CODE_TTL));
        v.setUser(user);
        v.setAttempts(0);
        String code = String.format("%06d", random.nextInt(1_000_000));
        v.setCode(code);
        validations.save(v);
        notifications.sendActivationCode(user, code);
    }

    @Transactional(noRollbackFor = ApiException.class)
    public void activate(ActivationRequest req) {
        User user = users.findFirstByEmailIgnoreCase(normalize(req.email()))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, INVALID_CODE));
        if (user.isActif()) {
            return;
        }
        Validation v = validations.findFirstByUser(user)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, INVALID_CODE));
        int attempts = v.getAttempts() == null ? 0 : v.getAttempts();
        if (Instant.now().isAfter(v.getExpiration()) || attempts >= MAX_CODE_ATTEMPTS) {
            throw new ApiException(HttpStatus.BAD_REQUEST, INVALID_CODE);
        }
        if (!MessageDigest.isEqual(v.getCode().getBytes(StandardCharsets.UTF_8),
                req.code().getBytes(StandardCharsets.UTF_8))) {
            v.setAttempts(attempts + 1);
            validations.save(v);
            throw new ApiException(HttpStatus.BAD_REQUEST, INVALID_CODE);
        }
        user.setActif(true);
        users.save(user);
        validations.delete(v);
    }

    @Transactional
    public LoginResponse login(LoginRequest req) {
        User user = users.findFirstByEmailIgnoreCase(normalize(req.email())).orElse(null);
        if (user == null) {
            encoder.matches(req.password(), dummyHash);
            throw new ApiException(HttpStatus.UNAUTHORIZED, BAD_CREDENTIALS);
        }
        if (!passwordMatches(user, req.password())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, BAD_CREDENTIALS);
        }
        if (!user.isActif()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Compte non activé : saisissez le code reçu par e-mail");
        }
        JwtService.IssuedToken token = jwt.issue(user);
        return new LoginResponse(token.token(), user.getStatus(), user.getFullName(), user.getId(),
                token.expiresAt().toEpochMilli());
    }

    /** Checks the password and transparently migrates legacy plaintext passwords to BCrypt. */
    private boolean passwordMatches(User user, String raw) {
        String stored = user.getPassword();
        if (stored == null) {
            return false;
        }
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
            return encoder.matches(raw, stored);
        }
        boolean ok = MessageDigest.isEqual(stored.getBytes(StandardCharsets.UTF_8), raw.getBytes(StandardCharsets.UTF_8));
        if (ok) {
            user.setPassword(encoder.encode(raw));
            users.save(user);
        }
        return ok;
    }
}

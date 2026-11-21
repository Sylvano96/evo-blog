package com.example.SpringBoot.web;

import java.time.Duration;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.SpringBoot.dto.Dtos.ActivationRequest;
import com.example.SpringBoot.dto.Dtos.LoginRequest;
import com.example.SpringBoot.dto.Dtos.LoginResponse;
import com.example.SpringBoot.dto.Dtos.MessageResponse;
import com.example.SpringBoot.dto.Dtos.RegisterRequest;
import com.example.SpringBoot.dto.Dtos.ResendCodeRequest;
import com.example.SpringBoot.security.RateLimiter;
import com.example.SpringBoot.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final AuthService auth;
    private final RateLimiter limiter;

    public AuthController(AuthService auth, RateLimiter limiter) {
        this.auth = auth;
        this.limiter = limiter;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse register(@Valid @RequestBody RegisterRequest req, HttpServletRequest http) {
        limiter.check("register:" + http.getRemoteAddr(), 10, WINDOW);
        auth.register(req);
        return new MessageResponse("Compte créé : un code d'activation vous a été envoyé par e-mail");
    }

    @PostMapping("/activate")
    public MessageResponse activate(@Valid @RequestBody ActivationRequest req, HttpServletRequest http) {
        limiter.check("activate:" + http.getRemoteAddr(), 20, WINDOW);
        auth.activate(req);
        return new MessageResponse("Compte activé, vous pouvez vous connecter");
    }

    @PostMapping("/resend-code")
    public MessageResponse resend(@Valid @RequestBody ResendCodeRequest req, HttpServletRequest http) {
        limiter.check("resend:" + http.getRemoteAddr(), 5, WINDOW);
        limiter.check("resend:" + req.email().toLowerCase(), 3, WINDOW);
        auth.resendCode(req.email());
        return new MessageResponse("Si ce compte existe et n'est pas activé, un nouveau code a été envoyé");
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req, HttpServletRequest http) {
        limiter.check("login-ip:" + http.getRemoteAddr(), 30, WINDOW);
        limiter.check("login:" + req.email().toLowerCase(), 10, WINDOW);
        return auth.login(req);
    }
}

package com.example.SpringBoot.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.SpringBoot.domain.User;
import com.example.SpringBoot.web.ApiException;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final boolean enabled;
    private final String from;

    public NotificationService(ObjectProvider<JavaMailSender> mailSender,
            @Value("${app.mail.enabled:false}") boolean enabled,
            @Value("${spring.mail.username:}") String from) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.from = from;
    }

    public void sendActivationCode(User user, String code) {
        if (!enabled) {
            // Development mode: no SMTP account configured.
            log.info("[MAIL DISABLED] Activation code for {}: {}", user.getEmail(), code);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(user.getEmail());
        message.setSubject("Votre code d'activation EvoBlog");
        message.setText("Bonjour " + user.getFullName() + ",\n\n"
                + "Votre code d'activation est : " + code + "\n"
                + "Il est valable 10 minutes.\n\n"
                + "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\n"
                + "L'équipe EvoBlog");
        try {
            mailSender.getObject().send(message);
        } catch (MailException e) {
            log.error("Could not send activation e-mail", e);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Impossible d'envoyer l'e-mail d'activation pour le moment");
        }
    }
}

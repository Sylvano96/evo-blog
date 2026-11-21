package com.example.SpringBoot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// The default in-memory user (and its generated password printed in the logs) is not used:
// authentication is handled by JWT, see security/JwtAuthFilter.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

}

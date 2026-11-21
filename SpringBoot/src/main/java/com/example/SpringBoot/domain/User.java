package com.example.SpringBoot.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    private String lastName;

    private String email;

    /** Role of the user: {@link Roles#ADMIN} or {@link Roles#AUTHOR}. */
    private String status;

    /** BCrypt hash (legacy plaintext values are upgraded at the next login). */
    private String password;

    private boolean actif = false;

    public String getFullName() {
        return (name == null ? "" : name) + (lastName == null || lastName.isBlank() ? "" : " " + lastName);
    }

    public boolean isAdmin() {
        return Roles.ADMIN.equals(status);
    }
}

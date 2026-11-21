package com.example.SpringBoot.domain;

import java.time.Instant;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Pending e-mail activation code of a user. */
@Entity
@Table(name = "validation")
@Getter
@Setter
@NoArgsConstructor
public class Validation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Instant creation;

    private Instant expiration;

    private String code;

    /** Number of wrong codes submitted (brute-force protection). */
    private Integer attempts = 0;

    // No cascade: deleting a validation must never delete the user.
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}

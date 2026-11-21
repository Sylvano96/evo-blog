package com.example.SpringBoot.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import com.example.SpringBoot.domain.User;
import com.example.SpringBoot.domain.Validation;

public interface ValidationRepository extends JpaRepository<Validation, Long> {

    Optional<Validation> findFirstByUser(User user);

    @Transactional
    void deleteByUser(User user);
}

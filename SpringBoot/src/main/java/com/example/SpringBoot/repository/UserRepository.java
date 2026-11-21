package com.example.SpringBoot.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.SpringBoot.domain.User;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findFirstByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByStatusOrderByNameAsc(String status);

    long countByStatus(String status);
}

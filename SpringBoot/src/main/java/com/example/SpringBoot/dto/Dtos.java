package com.example.SpringBoot.dto;

import java.util.Date;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request / response objects of the API. Entities are never bound directly from
 * JSON (mass-assignment) nor serialised directly (password hashes, e-mails...).
 */
public final class Dtos {

    private Dtos() {
    }

    // ------------------------------------------------------------------ auth

    public record RegisterRequest(
            @NotBlank @Size(max = 60) String name,
            @Size(max = 60) String lastName,
            @NotBlank @Email @Size(max = 120) String email,
            // BCrypt ignores everything after 72 bytes
            @NotBlank @Size(min = 9, max = 72) String password) {
    }

    public record ActivationRequest(
            @NotBlank @Email String email,
            @NotBlank @Pattern(regexp = "\\d{6}", message = "Le code doit contenir 6 chiffres") String code) {
    }

    public record ResendCodeRequest(@NotBlank @Email String email) {
    }

    public record LoginRequest(@NotBlank @Size(max = 120) String email, @NotBlank @Size(max = 200) String password) {
    }

    public record LoginResponse(String token, String role, String name, Integer userId, long expiresAt) {
    }

    public record MessageResponse(String message) {
    }

    // ----------------------------------------------------------------- posts

    public record ContentBlock(
            Long id,
            @NotBlank @Size(max = 200) String titlePara,
            @NotBlank @Size(max = 20000) String content) {
    }

    public record PostRequest(
            @NotBlank @Size(max = 70) String title,
            @NotBlank String category,
            @NotBlank String status,
            @NotBlank @Size(max = 120) String image,
            @NotEmpty @Size(max = 50) List<@Valid @NotNull ContentBlock> contents) {
    }

    public record PostResponse(
            Long id,
            String title,
            String category,
            String status,
            String image,
            List<ContentBlock> contents,
            Date createdAt,
            Integer userId,
            String authorName) {
    }

    public record UploadResponse(String filename) {
    }

    // -------------------------------------------------------------- comments

    public record CommentRequest(
            @NotBlank @Size(max = 50) String pseudo,
            @NotBlank @Size(max = 2000) String comment) {
    }

    public record CommentResponse(Long id, String pseudo, String comment, Long postId, Date createdAt) {
    }

    // ----------------------------------------------------------------- admin

    public record AuthorSummary(Integer id, String name, String lastName, String email, boolean actif,
            long postCount, Date lastPostAt) {
    }

    public record CategoryCount(String category, long count) {
    }

    public record StatsResponse(
            List<CategoryCount> publishedLastMonth,
            List<CategoryCount> publishedByCategory,
            long published,
            long drafts,
            long authors) {
    }
}

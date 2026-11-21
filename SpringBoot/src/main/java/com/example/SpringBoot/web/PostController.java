package com.example.SpringBoot.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.SpringBoot.dto.Dtos.CommentRequest;
import com.example.SpringBoot.dto.Dtos.CommentResponse;
import com.example.SpringBoot.dto.Dtos.PostRequest;
import com.example.SpringBoot.dto.Dtos.PostResponse;
import com.example.SpringBoot.dto.Dtos.UploadResponse;
import com.example.SpringBoot.security.AuthUser;
import com.example.SpringBoot.security.RateLimiter;
import com.example.SpringBoot.service.ImageStorageService;
import com.example.SpringBoot.service.PostService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class PostController {

    private final PostService posts;
    private final ImageStorageService images;
    private final RateLimiter limiter;

    public PostController(PostService posts, ImageStorageService images, RateLimiter limiter) {
        this.posts = posts;
        this.images = images;
        this.limiter = limiter;
    }

    // ---------------------------------------------------------------- public

    @GetMapping("/posts")
    public List<PostResponse> published() {
        return posts.published();
    }

    @GetMapping("/posts/{id}")
    public PostResponse get(@PathVariable Long id, @AuthenticationPrincipal AuthUser caller) {
        return posts.get(id, caller);
    }

    @GetMapping("/posts/{id}/comments")
    public List<CommentResponse> comments(@PathVariable Long id, @AuthenticationPrincipal AuthUser caller) {
        return posts.comments(id, caller);
    }

    @PostMapping("/posts/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse comment(@PathVariable Long id, @Valid @RequestBody CommentRequest req,
            HttpServletRequest http) {
        limiter.check("comment:" + http.getRemoteAddr(), 10, java.time.Duration.ofMinutes(5));
        return posts.addComment(id, req);
    }

    // --------------------------------------------------- authors and admins

    @GetMapping("/me/posts")
    public List<PostResponse> mine(@AuthenticationPrincipal AuthUser caller) {
        return posts.byAuthor(caller.id());
    }

    @PostMapping("/uploads")
    @ResponseStatus(HttpStatus.CREATED)
    public UploadResponse upload(@RequestParam("file") MultipartFile file) {
        return new UploadResponse(images.store(file));
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponse create(@Valid @RequestBody PostRequest req, @AuthenticationPrincipal AuthUser caller) {
        return posts.create(req, caller);
    }

    @PutMapping("/posts/{id}")
    public PostResponse update(@PathVariable Long id, @Valid @RequestBody PostRequest req,
            @AuthenticationPrincipal AuthUser caller) {
        return posts.update(id, req, caller);
    }

    @DeleteMapping("/posts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal AuthUser caller) {
        posts.delete(id, caller);
    }

    @DeleteMapping("/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Long id, @AuthenticationPrincipal AuthUser caller) {
        posts.deleteComment(id, caller);
    }
}

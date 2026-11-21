package com.example.SpringBoot.web;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.SpringBoot.dto.Dtos.AuthorSummary;
import com.example.SpringBoot.dto.Dtos.PostResponse;
import com.example.SpringBoot.dto.Dtos.StatsResponse;
import com.example.SpringBoot.security.AuthUser;
import com.example.SpringBoot.service.AdminService;
import com.example.SpringBoot.service.PostService;

/** Every route here requires ROLE_ADMIN (see SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService admin;
    private final PostService posts;

    public AdminController(AdminService admin, PostService posts) {
        this.admin = admin;
        this.posts = posts;
    }

    @GetMapping("/stats")
    public StatsResponse stats() {
        return admin.stats();
    }

    @GetMapping("/posts")
    public List<PostResponse> posts(@RequestParam(name = "q", required = false) String query) {
        return posts.all(query);
    }

    @GetMapping("/users")
    public List<AuthorSummary> authors() {
        return admin.authors();
    }

    @GetMapping("/users/{id}/posts")
    public List<PostResponse> userPosts(@PathVariable Integer id) {
        return posts.byAuthor(id);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Integer id, @AuthenticationPrincipal AuthUser caller) {
        admin.deleteUser(id, caller);
    }
}

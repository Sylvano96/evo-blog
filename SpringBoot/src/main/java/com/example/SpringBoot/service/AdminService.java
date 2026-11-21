package com.example.SpringBoot.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.SpringBoot.domain.Post;
import com.example.SpringBoot.domain.Roles;
import com.example.SpringBoot.domain.User;
import com.example.SpringBoot.dto.Dtos.AuthorSummary;
import com.example.SpringBoot.dto.Dtos.CategoryCount;
import com.example.SpringBoot.dto.Dtos.StatsResponse;
import com.example.SpringBoot.repository.PostRepository;
import com.example.SpringBoot.repository.UserRepository;
import com.example.SpringBoot.repository.ValidationRepository;
import com.example.SpringBoot.security.AuthUser;
import com.example.SpringBoot.web.ApiException;

@Service
public class AdminService {

    private final UserRepository users;
    private final PostRepository posts;
    private final ValidationRepository validations;
    private final PostService postService;

    public AdminService(UserRepository users, PostRepository posts, ValidationRepository validations,
            PostService postService) {
        this.users = users;
        this.posts = posts;
        this.validations = validations;
        this.postService = postService;
    }

    public List<AuthorSummary> authors() {
        Map<Integer, Object[]> stats = new HashMap<>();
        for (Object[] row : posts.statsByAuthor()) {
            stats.put((Integer) row[0], row);
        }
        return users.findByStatusOrderByNameAsc(Roles.AUTHOR).stream().map(u -> {
            Object[] s = stats.get(u.getId());
            long count = s == null ? 0 : ((Number) s[1]).longValue();
            Date last = s == null ? null : (Date) s[2];
            return new AuthorSummary(u.getId(), u.getName(), u.getLastName(), u.getEmail(), u.isActif(), count, last);
        }).toList();
    }

    public StatsResponse stats() {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate firstOfThisMonth = LocalDate.now(zone).withDayOfMonth(1);
        Date start = Date.from(firstOfThisMonth.minusMonths(1).atStartOfDay(zone).toInstant());
        Date end = Date.from(firstOfThisMonth.atStartOfDay(zone).toInstant().minusMillis(1));
        return new StatsResponse(
                toCounts(posts.countByCategoryBetween(Post.PUBLISHED, start, end)),
                toCounts(posts.countByCategory(Post.PUBLISHED)),
                posts.countByStatus(Post.PUBLISHED),
                posts.countByStatus(Post.DRAFT),
                users.countByStatus(Roles.AUTHOR));
    }

    @Transactional
    public void deleteUser(Integer id, AuthUser caller) {
        User user = users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Auteur introuvable"));
        if (user.isAdmin() || id.equals(caller.id())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Un compte administrateur ne peut pas être supprimé ici");
        }
        posts.findByUserIdOrderByCreatedAtDesc(id).forEach(postService::deleteWithDependencies);
        validations.deleteByUser(user);
        users.delete(user);
    }

    private static List<CategoryCount> toCounts(List<Object[]> rows) {
        return rows.stream().map(r -> new CategoryCount((String) r[0], ((Number) r[1]).longValue())).toList();
    }
}

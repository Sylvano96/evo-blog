package com.example.SpringBoot.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.SpringBoot.domain.Post;

// All queries are parameterised JPQL: user input is never concatenated into SQL.
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByStatusOrderByCreatedAtDesc(String status);

    List<Post> findByUserIdOrderByCreatedAtDesc(Integer userId);

    long countByStatus(String status);

    @Query("SELECT p FROM Post p WHERE lower(p.title) LIKE :pattern ESCAPE '\\' "
            + "OR lower(p.category) LIKE :pattern ESCAPE '\\' "
            + "OR lower(p.status) LIKE :pattern ESCAPE '\\' "
            + "ORDER BY p.createdAt DESC")
    List<Post> search(@Param("pattern") String pattern);

    @Query("SELECT p.category, COUNT(p) FROM Post p "
            + "WHERE p.status = :status AND p.createdAt BETWEEN :start AND :end GROUP BY p.category")
    List<Object[]> countByCategoryBetween(@Param("status") String status, @Param("start") Date start,
            @Param("end") Date end);

    @Query("SELECT p.category, COUNT(p) FROM Post p WHERE p.status = :status GROUP BY p.category")
    List<Object[]> countByCategory(@Param("status") String status);

    /** Rows: [userId, number of posts, date of the latest post]. */
    @Query("SELECT p.userId, COUNT(p), MAX(p.createdAt) FROM Post p GROUP BY p.userId")
    List<Object[]> statsByAuthor();
}

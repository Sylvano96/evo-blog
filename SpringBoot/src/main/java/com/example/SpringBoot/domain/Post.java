package com.example.SpringBoot.domain;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
public class Post {

    public static final String PUBLISHED = "publié";
    public static final String DRAFT = "non publié";
    public static final Set<String> STATUSES = Set.of(PUBLISHED, DRAFT);

    public static final Set<String> CATEGORIES = Set.of(
            "Actualités technologique",
            "Intelligence Artificielle",
            "Technologie Mobile",
            "Innovations Emergantes",
            "Gadgets et Wearables",
            "Technologie et Environnement",
            "Sécurité Informatique",
            "Technologie et Santé",
            "Technologie et Société",
            "Futur et Futurologie");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Integer userId;

    private String image;

    private String category;

    private String status;

    /** Paragraphs: [{id, titlePara, content}] stored as jsonb. */
    @JdbcTypeCode(SqlTypes.JSON) // jsonb on PostgreSQL
    private List<Map<String, Object>> contents;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Date createdAt;

    public boolean isPublished() {
        return PUBLISHED.equals(status);
    }
}

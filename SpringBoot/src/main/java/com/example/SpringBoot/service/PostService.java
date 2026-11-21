package com.example.SpringBoot.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.SpringBoot.domain.Comment;
import com.example.SpringBoot.domain.Post;
import com.example.SpringBoot.domain.User;
import com.example.SpringBoot.dto.Dtos.CommentRequest;
import com.example.SpringBoot.dto.Dtos.CommentResponse;
import com.example.SpringBoot.dto.Dtos.ContentBlock;
import com.example.SpringBoot.dto.Dtos.PostRequest;
import com.example.SpringBoot.dto.Dtos.PostResponse;
import com.example.SpringBoot.repository.CommentRepository;
import com.example.SpringBoot.repository.PostRepository;
import com.example.SpringBoot.repository.UserRepository;
import com.example.SpringBoot.security.AuthUser;
import com.example.SpringBoot.web.ApiException;

@Service
public class PostService {

    private final PostRepository posts;
    private final CommentRepository comments;
    private final UserRepository users;
    private final ImageStorageService images;

    public PostService(PostRepository posts, CommentRepository comments, UserRepository users,
            ImageStorageService images) {
        this.posts = posts;
        this.comments = comments;
        this.users = users;
        this.images = images;
    }

    // ------------------------------------------------------------------ read

    public List<PostResponse> published() {
        return toResponses(posts.findByStatusOrderByCreatedAtDesc(Post.PUBLISHED));
    }

    /** Drafts are only visible to their author and to administrators. */
    public PostResponse get(Long id, AuthUser caller) {
        return toResponse(findVisible(id, caller));
    }

    public List<PostResponse> byAuthor(Integer userId) {
        return toResponses(posts.findByUserIdOrderByCreatedAtDesc(userId));
    }

    public List<PostResponse> all(String query) {
        if (query == null || query.isBlank()) {
            return toResponses(posts.findAllByOrderByCreatedAtDesc());
        }
        String escaped = query.trim().toLowerCase()
                .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        return toResponses(posts.search("%" + escaped + "%"));
    }

    // ----------------------------------------------------------------- write

    @Transactional
    public PostResponse create(PostRequest req, AuthUser caller) {
        validate(req);
        images.requireExisting(req.image());
        Post post = new Post();
        apply(post, req);
        post.setImage(req.image());
        post.setUserId(caller.id()); // the author is the caller, not a field of the request
        return toResponse(posts.save(post));
    }

    @Transactional
    public PostResponse update(Long id, PostRequest req, AuthUser caller) {
        Post post = posts.findById(id).orElseThrow(PostService::notFound);
        requireManage(post, caller);
        validate(req);
        String oldImage = post.getImage();
        if (!Objects.equals(oldImage, req.image())) {
            images.requireExisting(req.image());
            post.setImage(req.image());
        }
        apply(post, req);
        Post saved = posts.save(post);
        if (!Objects.equals(oldImage, saved.getImage())) {
            images.deleteQuietly(oldImage);
        }
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id, AuthUser caller) {
        Post post = posts.findById(id).orElseThrow(PostService::notFound);
        requireManage(post, caller);
        deleteWithDependencies(post);
    }

    /** Also used when an author account is removed. */
    @Transactional
    public void deleteWithDependencies(Post post) {
        comments.deleteByPostId(post.getId());
        posts.delete(post);
        images.deleteQuietly(post.getImage());
    }

    // -------------------------------------------------------------- comments

    public List<CommentResponse> comments(Long postId, AuthUser caller) {
        findVisible(postId, caller);
        return comments.findByPostIdOrderByCreatedAtAsc(postId).stream().map(PostService::toResponse).toList();
    }

    @Transactional
    public CommentResponse addComment(Long postId, CommentRequest req) {
        Post post = posts.findById(postId).filter(Post::isPublished).orElseThrow(PostService::notFound);
        Comment c = new Comment();
        c.setPostId(post.getId());
        c.setPseudo(req.pseudo().trim());
        c.setComment(req.comment().trim());
        return toResponse(comments.save(c));
    }

    @Transactional
    public void deleteComment(Long commentId, AuthUser caller) {
        Comment c = comments.findById(commentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Commentaire introuvable"));
        Post post = posts.findById(c.getPostId()).orElse(null);
        if (!caller.isAdmin() && (post == null || !caller.canManage(post.getUserId()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Action non autorisée");
        }
        comments.delete(c);
    }

    // --------------------------------------------------------------- helpers

    private Post findVisible(Long id, AuthUser caller) {
        Post post = posts.findById(id).orElseThrow(PostService::notFound);
        if (!post.isPublished() && (caller == null || !caller.canManage(post.getUserId()))) {
            throw notFound(); // do not reveal that a draft exists
        }
        return post;
    }

    private static void requireManage(Post post, AuthUser caller) {
        if (!caller.canManage(post.getUserId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Vous ne pouvez modifier que vos propres articles");
        }
    }

    private static void validate(PostRequest req) {
        if (!Post.CATEGORIES.contains(req.category())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Catégorie inconnue");
        }
        if (!Post.STATUSES.contains(req.status())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Statut inconnu");
        }
    }

    private static void apply(Post post, PostRequest req) {
        post.setTitle(req.title().trim());
        post.setCategory(req.category());
        post.setStatus(req.status());
        long index = 1;
        List<Map<String, Object>> blocks = new ArrayList<>();
        for (ContentBlock b : req.contents()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", b.id() != null ? b.id() : index);
            m.put("titlePara", b.titlePara().trim());
            m.put("content", b.content().trim());
            blocks.add(m);
            index++;
        }
        post.setContents(blocks);
    }

    private static ApiException notFound() {
        return new ApiException(HttpStatus.NOT_FOUND, "Article introuvable");
    }

    private List<PostResponse> toResponses(List<Post> list) {
        Map<Integer, String> names = authorNames(list.stream().map(Post::getUserId).filter(Objects::nonNull).collect(Collectors.toSet()));
        return list.stream().map(p -> toResponse(p, names.get(p.getUserId()))).toList();
    }

    private PostResponse toResponse(Post p) {
        String name = p.getUserId() == null ? null : users.findById(p.getUserId()).map(User::getFullName).orElse(null);
        return toResponse(p, name);
    }

    private Map<Integer, String> authorNames(Collection<Integer> ids) {
        return users.findAllById(ids).stream().collect(Collectors.toMap(User::getId, User::getFullName, (a, b) -> a));
    }

    private static PostResponse toResponse(Post p, String authorName) {
        List<ContentBlock> blocks = p.getContents() == null ? List.of() : p.getContents().stream()
                .map(m -> new ContentBlock(toLong(m.get("id")), str(m.get("titlePara")), str(m.get("content"))))
                .toList();
        return new PostResponse(p.getId(), p.getTitle(), p.getCategory(), p.getStatus(), p.getImage(), blocks,
                p.getCreatedAt(), p.getUserId(), authorName == null ? "Auteur inconnu" : authorName);
    }

    static CommentResponse toResponse(Comment c) {
        return new CommentResponse(c.getId(), c.getPseudo(), c.getComment(), c.getPostId(), c.getCreatedAt());
    }

    private static Long toLong(Object o) {
        if (o instanceof Number n) {
            return n.longValue();
        }
        try {
            return o == null ? null : Long.valueOf(o.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static String str(Object o) {
        return o == null ? "" : o.toString();
    }
}

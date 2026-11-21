package com.example.SpringBoot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import com.example.SpringBoot.domain.Roles;
import com.example.SpringBoot.domain.User;
import com.example.SpringBoot.domain.Validation;
import com.example.SpringBoot.repository.CommentRepository;
import com.example.SpringBoot.repository.PostRepository;
import com.example.SpringBoot.repository.UserRepository;
import com.example.SpringBoot.repository.ValidationRepository;
import com.example.SpringBoot.service.ImageStorageService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:evoblog;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.mail.enabled=false",
        "app.jwt.secret=test-secret-test-secret-test-secret-0123456789",
        "app.upload-dir=target/test-uploads",
        "app.admin.email=",
        "logging.file.name=" })
class SecurityIntegrationTests {

    private static final byte[] PNG = { (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0 };

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepository users;
    @Autowired PostRepository posts;
    @Autowired CommentRepository comments;
    @Autowired ValidationRepository validations;
    @Autowired PasswordEncoder encoder;
    @Autowired ImageStorageService storage;

    @BeforeEach
    void clean() {
        comments.deleteAll();
        posts.deleteAll();
        validations.deleteAll();
        users.deleteAll();
    }

    // ---------------------------------------------------------------- helpers

    private User user(String email, String role, String rawPassword, boolean active) {
        User u = new User();
        u.setName("N");
        u.setLastName("L");
        u.setEmail(email);
        u.setStatus(role);
        u.setPassword(rawPassword.startsWith("plain:") ? rawPassword.substring(6) : encoder.encode(rawPassword));
        u.setActif(active);
        return users.save(u);
    }

    private String login(String email, String password) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("email", email, "password", password))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return "Bearer " + json.readTree(body).get("token").asText();
    }

    private String upload(String token) throws Exception {
        String body = mvc.perform(multipart("/api/uploads")
                .file(new MockMultipartFile("file", "photo.png", "image/png", PNG))
                .header("Authorization", token))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("filename").asText();
    }

    private String postJson(String image, String status) throws Exception {
        return json.writeValueAsString(Map.of(
                "title", "Titre", "category", "Intelligence Artificielle", "status", status, "image", image,
                "userId", 999, // must be ignored by the server
                "contents", new Object[] { Map.of("id", 1, "titlePara", "Intro", "content", "Bonjour") }));
    }

    private long createPost(String token, String status) throws Exception {
        String body = mvc.perform(post("/api/posts").header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON).content(postJson(upload(token), status)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("id").asLong();
    }

    // ------------------------------------------------------------------ tests

    @Test
    void signupCannotChooseRoleOrActivateItself() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name":"Eve","lastName":"X","email":"Eve@Example.com","password":"password123",
                         "status":"admin","actif":true}"""))
                .andExpect(status().isCreated());

        User created = users.findFirstByEmailIgnoreCase("eve@example.com").orElseThrow();
        assertThat(created.getStatus()).isEqualTo(Roles.AUTHOR);
        assertThat(created.isActif()).isFalse();
        assertThat(created.getPassword()).startsWith("$2").doesNotContain("password123");

        // inactive account cannot log in
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"eve@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void activationCodeIsLockedAfterFiveWrongAttempts() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"A\",\"email\":\"a@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isCreated());
        Validation v = validations.findAll().get(0);
        String wrong = v.getCode().equals("000000") ? "111111" : "000000";
        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/api/auth/activate").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"a@example.com\",\"code\":\"" + wrong + "\"}"))
                    .andExpect(status().isBadRequest());
        }
        // even the right code is now refused
        mvc.perform(post("/api/auth/activate").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"a@example.com\",\"code\":\"" + v.getCode() + "\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void activationWithCorrectCodeThenLogin() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"B\",\"email\":\"b@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isCreated());
        String code = validations.findAll().get(0).getCode();
        mvc.perform(post("/api/auth/activate").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"b@example.com\",\"code\":\"" + code + "\"}"))
                .andExpect(status().isOk());
        assertThat(validations.count()).isZero();
        login("b@example.com", "password123");
    }

    @Test
    void legacyPlaintextPasswordIsUpgradedOnLogin() throws Exception {
        user("old@example.com", Roles.AUTHOR, "plain:oldpassword", true);
        login("old@example.com", "oldpassword");
        assertThat(users.findFirstByEmailIgnoreCase("old@example.com").orElseThrow().getPassword()).startsWith("$2");
        login("old@example.com", "oldpassword"); // still works with the hash
    }

    @Test
    void wrongPasswordAndUnknownEmailGiveTheSameAnswer() throws Exception {
        user("c@example.com", Roles.AUTHOR, "password123", true);
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"c@example.com\",\"password\":\"nope-nope\"}"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.message").value("Email ou mot de passe incorrect"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nobody@example.com\",\"password\":\"nope-nope\"}"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.message").value("Email ou mot de passe incorrect"));
    }

    @Test
    void adminEndpointsRequireAdminRole() throws Exception {
        user("author@example.com", Roles.AUTHOR, "password123", true);
        user("admin@example.com", Roles.ADMIN, "password123", true);
        mvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/users").header("Authorization", "Bearer forged.token.value"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/users").header("Authorization", login("author@example.com", "password123")))
                .andExpect(status().isForbidden());
        String body = mvc.perform(get("/api/admin/users").header("Authorization", login("admin@example.com", "password123")))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat(body).doesNotContain("password").doesNotContain("$2");
    }

    @Test
    void authorsCanOnlyManageTheirOwnPosts() throws Exception {
        user("alice@example.com", Roles.AUTHOR, "password123", true);
        User bob = user("bob@example.com", Roles.AUTHOR, "password123", true);
        String alice = login("alice@example.com", "password123");
        String bobToken = login("bob@example.com", "password123");

        long id = createPost(bobToken, "publié");
        assertThat(posts.findById(id).orElseThrow().getUserId()).isEqualTo(bob.getId()); // body userId ignored

        mvc.perform(put("/api/posts/" + id).header("Authorization", alice).contentType(MediaType.APPLICATION_JSON)
                .content(postJson(posts.findById(id).orElseThrow().getImage(), "publié")))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/posts/" + id).header("Authorization", alice)).andExpect(status().isForbidden());
        mvc.perform(delete("/api/posts/" + id)).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/posts/" + id).header("Authorization", bobToken)).andExpect(status().isNoContent());
    }

    @Test
    void draftsAreHiddenFromThePublic() throws Exception {
        user("d@example.com", Roles.AUTHOR, "password123", true);
        String token = login("d@example.com", "password123");
        long draft = createPost(token, "non publié");
        long published = createPost(token, "publié");

        mvc.perform(get("/api/posts/" + draft)).andExpect(status().isNotFound());
        mvc.perform(get("/api/posts/" + draft).header("Authorization", token)).andExpect(status().isOk());
        String list = mvc.perform(get("/api/posts")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        JsonNode arr = json.readTree(list);
        assertThat(arr).hasSize(1);
        assertThat(arr.get(0).get("id").asLong()).isEqualTo(published);
        assertThat(arr.get(0).get("authorName").asText()).isEqualTo("N L");
        // commenting a draft is impossible
        mvc.perform(post("/api/posts/" + draft + "/comments").contentType(MediaType.APPLICATION_JSON)
                .content("{\"pseudo\":\"x\",\"comment\":\"y\"}")).andExpect(status().isNotFound());
    }

    @Test
    void commentCannotOverwriteAnotherComment() throws Exception {
        user("e@example.com", Roles.AUTHOR, "password123", true);
        String token = login("e@example.com", "password123");
        long postId = createPost(token, "publié");
        mvc.perform(post("/api/posts/" + postId + "/comments").contentType(MediaType.APPLICATION_JSON)
                .content("{\"pseudo\":\"first\",\"comment\":\"original\"}")).andExpect(status().isCreated());
        long firstId = comments.findAll().get(0).getId();
        mvc.perform(post("/api/posts/" + postId + "/comments").contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\":" + firstId + ",\"pseudo\":\"evil\",\"comment\":\"replaced\"}"))
                .andExpect(status().isCreated());
        assertThat(comments.findById(firstId).orElseThrow().getComment()).isEqualTo("original");
        assertThat(comments.count()).isEqualTo(2);
        // anonymous users cannot delete comments
        mvc.perform(delete("/api/comments/" + firstId)).andExpect(status().isUnauthorized());
    }

    @Test
    void uploadRejectsNonImagesAndIgnoresClientFileName() throws Exception {
        user("f@example.com", Roles.AUTHOR, "password123", true);
        String token = login("f@example.com", "password123");
        mvc.perform(multipart("/api/uploads").file(new MockMultipartFile("file", "x.png", "image/png",
                "<script>alert(1)</script>".getBytes())).header("Authorization", token))
                .andExpect(status().isUnsupportedMediaType());

        String body = mvc.perform(multipart("/api/uploads")
                .file(new MockMultipartFile("file", "../../evil.png", "image/png", PNG)).header("Authorization", token))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String name = json.readTree(body).get("filename").asText();
        assertThat(name).matches("[0-9a-f-]{36}\\.png");
        assertThat(Files.exists(storage.getDirectory().resolve(name))).isTrue();
        assertThat(Files.exists(Path.of("evil.png"))).isFalse();

        // a post cannot point to a file outside the upload folder
        mvc.perform(post("/api/posts").header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
                .content(postJson("../../pom.xml", "publié"))).andExpect(status().isBadRequest());
    }

    @Test
    void anonymousCannotUpload() throws Exception {
        mvc.perform(multipart("/api/uploads").file(new MockMultipartFile("file", "a.png", "image/png", PNG)))
                .andExpect(status().isUnauthorized());
    }
}

# EvoBlog

A tech blog platform: readers browse and comment on articles, authors write them, and administrators moderate.

| Part | Stack | Folder |
| --- | --- | --- |
| API | Spring Boot 3.5, Spring Security (JWT), JPA, PostgreSQL | `SpringBoot/` |
| Web app | Angular 19 (standalone components, SSR for public pages) | `projet/` |

## Run it with Docker (recommended)

Three containers: PostgreSQL, the Spring Boot API and the Angular SSR server.
Only the web app is published; it forwards `/api` and `/images` to the API.

```bash
cp .env.docker.example .env      # then edit the values (DB_PASSWORD, JWT_SECRET, ADMIN_*)
docker compose up -d --build
```

Open http://localhost:4000. With `MAIL_ENABLED=false`, read activation codes with
`docker compose logs api`. Data and uploaded images are kept in Docker volumes.

## Run it locally (without Docker)

### 1. Database
Create an empty PostgreSQL database (tables are created automatically):

```sql
CREATE DATABASE evoblog;
```

### 2. API (port 8080)

```bash
cd SpringBoot
cp .env.example .env      # then edit the values
./mvnw spring-boot:run
```

Everything sensitive is read from environment variables or the git-ignored `.env`
file. Nothing secret lives in `application.properties`.

| Variable | Purpose |
| --- | --- |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL connection |
| `JWT_SECRET` | Token signing key, **at least 32 characters** (`openssl rand -base64 48`) |
| `MAIL_ENABLED`, `MAIL_USERNAME`, `MAIL_PASSWORD` | SMTP for activation codes. When `MAIL_ENABLED=false`, codes are printed in the API log instead |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Creates the first admin account at startup (password ≥ 12 chars) |
| `UPLOAD_DIR` | Image folder (default `./uploads`). Point it at your old folder to keep existing images |
| `CORS_ORIGINS` | Allowed front-end origins (default `http://localhost:4200`) |

Run the tests with `./mvnw test`. They use an in-memory H2 database, so no PostgreSQL is needed.

### 3. Web app (port 4200)

```bash
cd projet
npm install
npm start
```

The browser calls `/api` and `/images` on the same origin: the dev server
(`proxy.conf.json`) or the Node SSR server forwards them to `http://localhost:8080`
(override with `API_INTERNAL_URL`).

## Roles

| Role | Can |
| --- | --- |
| Visitor | Read published articles, comment |
| Author (`redacteur`) | Everything above, plus create, edit and delete **their own** articles and moderate comments on them |
| Admin | Everything, plus see drafts, delete any article or comment, manage authors, view statistics |

Sign-up always creates an inactive author. The account is activated with a 6-digit
code sent by e-mail, valid for 10 minutes and locked after 5 wrong attempts. Admin
accounts can only be created through `ADMIN_EMAIL` / `ADMIN_PASSWORD` (or directly in the database).

## API overview

```
POST   /api/auth/register | activate | resend-code | login     public
GET    /api/posts, /api/posts/{id}, /api/posts/{id}/comments   public (drafts: owner/admin only)
POST   /api/posts/{id}/comments                                public
GET    /api/me/posts                                           author
POST   /api/uploads                                            author → {"filename": "..."}
POST   /api/posts   PUT/DELETE /api/posts/{id}                 author (own posts) / admin
DELETE /api/comments/{id}                                      post owner / admin
GET    /api/admin/stats | posts?q= | users | users/{id}/posts  admin
DELETE /api/admin/users/{id}                                   admin
```

Errors are always returned as `{"message": "..."}` with a meaningful HTTP status.

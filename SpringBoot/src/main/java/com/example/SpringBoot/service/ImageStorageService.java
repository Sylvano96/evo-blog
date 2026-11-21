package com.example.SpringBoot.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.SpringBoot.web.ApiException;

/**
 * Stores uploaded images under random names. The client-supplied file name is
 * never used to build a path (path traversal), and the real type is detected
 * from the file content (an .html or .svg renamed .png is rejected).
 */
@Service
public class ImageStorageService {

    private static final Logger log = LoggerFactory.getLogger(ImageStorageService.class);

    /** Names produced by this service, plus "uuid_name.ext" names produced by the previous version. */
    private static final Pattern SAFE_NAME = Pattern.compile("^[0-9a-fA-F-]{36}(_[A-Za-z0-9._-]{1,150})?(\\.[A-Za-z0-9]{1,5})?$");

    private final Path directory;

    public ImageStorageService(@Value("${app.upload-dir}") String uploadDir) throws IOException {
        this.directory = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(directory);
    }

    public Path getDirectory() {
        return directory;
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Aucun fichier reçu");
        }
        String extension;
        try (InputStream in = file.getInputStream()) {
            extension = detectExtension(in.readNBytes(12));
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Fichier illisible");
        }
        if (extension == null) {
            throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Formats acceptés : PNG, JPEG, GIF, WEBP");
        }
        String name = UUID.randomUUID() + "." + extension;
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, directory.resolve(name));
        } catch (IOException e) {
            log.error("Could not store upload", e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur lors de l'enregistrement du fichier");
        }
        return name;
    }

    /** Throws 400 unless {@code name} is a safe file name that exists in the upload directory. */
    public void requireExisting(String name) {
        Path path = resolve(name);
        if (path == null || !Files.isRegularFile(path)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Image introuvable, veuillez la téléverser à nouveau");
        }
    }

    public void deleteQuietly(String name) {
        Path path = resolve(name);
        if (path == null) {
            return;
        }
        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Could not delete image {}", name, e);
        }
    }

    private Path resolve(String name) {
        if (name == null || !SAFE_NAME.matcher(name).matches()) {
            return null;
        }
        Path path = directory.resolve(name).normalize();
        return path.getParent() != null && path.getParent().equals(directory) ? path : null;
    }

    private static String detectExtension(byte[] h) {
        if (h.length >= 8 && (h[0] & 0xFF) == 0x89 && h[1] == 'P' && h[2] == 'N' && h[3] == 'G') {
            return "png";
        }
        if (h.length >= 3 && (h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF) {
            return "jpg";
        }
        if (h.length >= 4 && h[0] == 'G' && h[1] == 'I' && h[2] == 'F' && h[3] == '8') {
            return "gif";
        }
        if (h.length >= 12 && h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F'
                && h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P') {
            return "webp";
        }
        return null;
    }
}

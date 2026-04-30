package com.dst.domain.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Slf4j
@Component
public class LocalFileStorage implements BinaryStorage {

    private final Path root;

    public LocalFileStorage(@Value("${dst.storage.root:/tmp/dst-data}") String root) {
        this.root = Path.of(root);
        try {
            Files.createDirectories(this.root);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create storage root: " + this.root, e);
        }
        log.info("LocalFileStorage initialised at {}", this.root.toAbsolutePath());
    }

    @Override
    public StoreResult store(String id, InputStream in) {
        // Shard by first two hex chars of the id to avoid millions of files in one directory.
        Path dir = root.resolve(id.substring(0, 2));
        Path file = dir.resolve(id);
        try {
            Files.createDirectories(dir);
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            try (DigestInputStream dis = new DigestInputStream(in, sha)) {
                Files.copy(dis, file, StandardCopyOption.REPLACE_EXISTING);
            }
            long size = Files.size(file);
            String hex = toHex(sha.digest());
            return new StoreResult(file.toString(), size, hex);
        } catch (IOException | NoSuchAlgorithmException e) {
            throw new IllegalStateException("Failed to store data " + id + " at " + file, e);
        }
    }

    @Override
    public InputStream open(String location) {
        try {
            return Files.newInputStream(Path.of(location));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to open stored data: " + location, e);
        }
    }

    @Override
    public void delete(String location) {
        try {
            Files.deleteIfExists(Path.of(location));
        } catch (IOException e) {
            log.warn("Failed to delete stored data {}: {}", location, e.getMessage());
        }
    }

    private static String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}

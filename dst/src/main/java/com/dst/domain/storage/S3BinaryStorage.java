package com.dst.domain.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.InputStream;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;

/**
 * S3-backed binary storage. Objects live in a single bucket keyed by their id.
 * SHA-256 is computed in one pass while the bytes are uploaded.
 */
@Slf4j
@Component
public class S3BinaryStorage implements BinaryStorage {

    private final S3Client s3;
    private final S3Presigner presigner;
    private final String bucket;

    public S3BinaryStorage(S3Client s3, S3Presigner presigner,
                           @Value("${dst.s3.bucket}") String bucket) {
        this.s3 = s3;
        this.presigner = presigner;
        this.bucket = bucket;
        log.info("S3BinaryStorage initialised — bucket={}", bucket);
    }

    @Override
    public StoreResult store(String id, InputStream in, long contentLength, String contentType) {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            DigestInputStream dis = new DigestInputStream(in, sha);
            PutObjectRequest req = PutObjectRequest.builder()
                .bucket(bucket)
                .key(id)
                .contentType(contentType)
                .contentLength(contentLength)
                .build();
            s3.putObject(req, RequestBody.fromInputStream(dis, contentLength));
            return new StoreResult(id, contentLength, toHex(sha.digest()));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    @Override
    public void delete(String location) {
        try {
            s3.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(location).build());
        } catch (RuntimeException e) {
            log.warn("Failed to delete object {}: {}", location, e.getMessage());
        }
    }

    @Override
    public String presignedGetUrl(String location, String filename, Duration ttl) {
        String disposition = "attachment";
        if (filename != null && !filename.isBlank()) {
            disposition = "attachment; filename=\"" + filename.replace("\"", "") + "\"";
        }
        GetObjectRequest get = GetObjectRequest.builder()
            .bucket(bucket)
            .key(location)
            .responseContentDisposition(disposition)
            .build();
        GetObjectPresignRequest presign = GetObjectPresignRequest.builder()
            .signatureDuration(ttl)
            .getObjectRequest(get)
            .build();
        return presigner.presignGetObject(presign).url().toString();
    }

    private static String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}

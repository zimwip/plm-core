package com.dst.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.checksums.RequestChecksumCalculation;
import software.amazon.awssdk.core.checksums.ResponseChecksumValidation;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * S3 wiring for the Garage object store.
 *
 * <p>Two distinct endpoints on purpose:
 * <ul>
 *   <li>{@code S3Client} talks to Garage over the internal network
 *       ({@code dst.s3.endpoint}) for put/get/delete.</li>
 *   <li>{@code S3Presigner} signs URLs for the browser-facing endpoint
 *       ({@code dst.s3.public-endpoint}). Presigning makes no network call,
 *       so it can sign for a host dst itself cannot reach.</li>
 * </ul>
 * Garage requires path-style addressing.
 */
@Configuration
public class S3Config {

    @Bean
    public S3Client s3Client(
            @Value("${dst.s3.endpoint}") String endpoint,
            @Value("${dst.s3.region}") String region,
            @Value("${dst.s3.access-key}") String accessKey,
            @Value("${dst.s3.secret-key}") String secretKey) {
        // AWS SDK 2.30+ adds CRC checksums + chunked signing by default, which
        // Garage (and most S3-compatible stores) reject. Only checksum when the
        // operation actually requires it.
        return S3Client.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey)))
            .forcePathStyle(true)
            .requestChecksumCalculation(RequestChecksumCalculation.WHEN_REQUIRED)
            .responseChecksumValidation(ResponseChecksumValidation.WHEN_REQUIRED)
            .httpClient(UrlConnectionHttpClient.create())
            .build();
    }

    @Bean
    public S3Presigner s3Presigner(
            @Value("${dst.s3.public-endpoint}") String publicEndpoint,
            @Value("${dst.s3.region}") String region,
            @Value("${dst.s3.access-key}") String accessKey,
            @Value("${dst.s3.secret-key}") String secretKey) {
        return S3Presigner.builder()
            .endpointOverride(URI.create(publicEndpoint))
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey)))
            .serviceConfiguration(S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build())
            .build();
    }
}

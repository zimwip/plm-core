package com.dst.domain;

/** A time-limited presigned download URL for a stored data object. */
public record PresignedUrl(String url, long expiresInSeconds, long size) {}

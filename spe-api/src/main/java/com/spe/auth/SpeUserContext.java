package com.spe.auth;

import java.util.List;

public record SpeUserContext(
    String userId,
    String username,
    List<String> roleIds,
    boolean isAdmin,
    String projectSpaceId
) {}

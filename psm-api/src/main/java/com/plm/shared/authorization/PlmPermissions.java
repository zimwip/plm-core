package com.plm.shared.authorization;

import java.lang.annotation.*;

/**
 * Container annotation for {@link PlmPermission @PlmPermission} repetition.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PlmPermissions {
    PlmPermission[] value();
}

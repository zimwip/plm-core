package com.plm.admin.shared;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global exception handler for psm-admin.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(PlmFunctionalException.class)
    public ResponseEntity<Map<String, Object>> handleFunctional(
            PlmFunctionalException e, HttpServletRequest req) {
        return functional(e.getHttpStatus(), e, req);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, Object>> handleValidation(
            RuntimeException e, HttpServletRequest req) {
        return functional(400, e, req);
    }

    /**
     * Quietly handle 404 on routes that aren't mapped (e.g. federated fan-out
     * probes from platform-api hitting {@code /internal/browse/visible} on a
     * service that doesn't contribute that axis). Avoids ERROR-spamming the
     * application log every time a sibling service is checked.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            NoResourceFoundException e, HttpServletRequest req) {
        log.debug("404 on {} {}", req.getMethod(), req.getRequestURI());
        return functional(404, e, req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleTechnical(
            Exception e, HttpServletRequest req) {
        log.error("Unexpected error on {} {}", req.getMethod(), req.getRequestURI(), e);
        return technical(500, e, req);
    }

    private ResponseEntity<Map<String, Object>> functional(int status, Exception e, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("category", "FUNCTIONAL");
        body.put("error",    e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());
        body.put("path",     req.getMethod() + " " + req.getRequestURI());
        body.put("status",   status);
        return ResponseEntity.status(status).body(body);
    }

    private ResponseEntity<Map<String, Object>> technical(int status, Exception e, HttpServletRequest req) {
        String[] stackTrace = Arrays.stream(e.getStackTrace())
                .map(StackTraceElement::toString)
                .toArray(String[]::new);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("category",   "TECHNICAL");
        body.put("error",      e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());
        body.put("type",       e.getClass().getName());
        body.put("path",       req.getMethod() + " " + req.getRequestURI());
        body.put("status",     status);
        body.put("stackTrace", stackTrace);
        return ResponseEntity.status(status).body(body);
    }
}

package com.plm.shared.exception;

import com.plm.shared.exception.PlmFunctionalException;
import com.plm.node.metamodel.internal.ValidationService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global exception handler — two distinct response shapes:
 *
 * FUNCTIONAL (expected business-rule violations, PlmFunctionalException subclasses
 * or standard validation exceptions):
 * <pre>
 * { "category": "FUNCTIONAL", "error": "Node X is locked by alice", "path": "POST /api/...", "status": 409 }
 * </pre>
 *
 * TECHNICAL (unexpected runtime errors):
 * <pre>
 * { "category": "TECHNICAL", "error": "...", "type": "java.lang.NullPointerException",
 *   "path": "GET /api/...", "status": 500, "stackTrace": ["frame1", "frame2", ...] }
 * </pre>
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ── Functional exceptions (PlmFunctionalException hierarchy) ─────────

    @ExceptionHandler(ValidationService.ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            ValidationService.ValidationException e, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("category",   "FUNCTIONAL");
        body.put("error",      e.getMessage());
        body.put("violations", e.getErrors());
        body.put("path",       req.getMethod() + " " + req.getRequestURI());
        body.put("status",     422);
        return ResponseEntity.status(422).body(body);
    }

    @ExceptionHandler(PlmFunctionalException.class)
    public ResponseEntity<Map<String, Object>> handleFunctional(
            PlmFunctionalException e, HttpServletRequest req) {
        return functional(e.getHttpStatus(), e, req);
    }

    // IllegalArgument / IllegalState are also treated as functional validation errors
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, Object>> handleValidation(
            RuntimeException e, HttpServletRequest req) {
        return functional(400, e, req);
    }

    // ── Technical / unexpected exceptions ────────────────────────────────

    /**
     * Quietly handle 404 on unmapped routes (e.g. federated fan-out probes
     * from platform-api targeting axes this service doesn't expose).
     */
    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            org.springframework.web.servlet.resource.NoResourceFoundException e, HttpServletRequest req) {
        log.debug("404 on {} {}", req.getMethod(), req.getRequestURI());
        return functional(404, e, req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleTechnical(
            Exception e, HttpServletRequest req) {
        log.error("Unexpected error on {} {}", req.getMethod(), req.getRequestURI(), e);
        return technical(500, e, req);
    }

    // ── builders ─────────────────────────────────────────────────────────

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

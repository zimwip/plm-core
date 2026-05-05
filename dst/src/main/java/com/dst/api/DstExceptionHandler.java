package com.dst.api;

import com.plm.platform.action.guard.GuardViolationException;
import com.plm.platform.authz.PolicyDeniedException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class DstExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(DstExceptionHandler.class);

    @ExceptionHandler(GuardViolationException.class)
    public ResponseEntity<Map<String, Object>> handleGuardViolation(
            GuardViolationException e, HttpServletRequest req) {
        return functional(422, e.getMessage(), req);
    }

    @ExceptionHandler(PolicyDeniedException.class)
    public ResponseEntity<Map<String, Object>> handlePolicyDenied(
            PolicyDeniedException e, HttpServletRequest req) {
        return functional(403, e.getMessage(), req);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, Object>> handleValidation(
            RuntimeException e, HttpServletRequest req) {
        return functional(400, e.getMessage(), req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleTechnical(
            Exception e, HttpServletRequest req) {
        log.error("Unexpected error on {} {}", req.getMethod(), req.getRequestURI(), e);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("category", "TECHNICAL");
        body.put("error", e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());
        body.put("path", req.getMethod() + " " + req.getRequestURI());
        body.put("status", 500);
        return ResponseEntity.status(500).body(body);
    }

    private ResponseEntity<Map<String, Object>> functional(int status, String message, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("category", "FUNCTIONAL");
        body.put("error", message);
        body.put("path", req.getMethod() + " " + req.getRequestURI());
        body.put("status", status);
        return ResponseEntity.status(status).body(body);
    }
}

package com.pno.api;

import com.plm.platform.authz.dto.ScopeRegistrationResponse;
import com.pno.domain.scope.ScopeConflictException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, Object>> handleValidation(RuntimeException e, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error",  e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());
        body.put("path",   req.getMethod() + " " + req.getRequestURI());
        body.put("status", 400);
        return ResponseEntity.status(400).body(body);
    }

    @ExceptionHandler(ScopeConflictException.class)
    public ResponseEntity<ScopeRegistrationResponse> handleScopeConflict(ScopeConflictException e) {
        return ResponseEntity.status(409).body(new ScopeRegistrationResponse(null, e.getConflicts()));
    }

    /**
     * Quietly handle 404 on unmapped routes (e.g. federated fan-out probes
     * from platform-api targeting axes this service doesn't expose).
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NoResourceFoundException e, HttpServletRequest req) {
        log.debug("404 on {} {}", req.getMethod(), req.getRequestURI());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error",  e.getMessage());
        body.put("path",   req.getMethod() + " " + req.getRequestURI());
        body.put("status", 404);
        return ResponseEntity.status(404).body(body);
    }
}

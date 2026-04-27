package com.pno.api;

import com.plm.platform.authz.dto.ScopeRegistrationResponse;
import com.pno.domain.scope.ScopeConflictException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

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
}

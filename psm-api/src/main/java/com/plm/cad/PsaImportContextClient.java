package com.plm.cad;

import com.plm.platform.spe.client.ServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PsaImportContextClient {

    private final ServiceClient serviceClient;

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> listAll() {
        try {
            return serviceClient.get("psa", "/api/psa/internal/import-contexts", List.class);
        } catch (Exception e) {
            log.warn("Could not list import contexts from PSA: {}", e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> findByCode(String code) {
        try {
            return serviceClient.get("psa", "/api/psa/internal/import-contexts/" + code, Map.class);
        } catch (Exception e) {
            log.warn("Import context '{}' not found/unreachable in PSA: {}", code, e.getMessage());
            return null;
        }
    }
}

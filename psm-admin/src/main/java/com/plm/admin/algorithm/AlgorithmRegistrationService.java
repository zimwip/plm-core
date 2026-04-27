package com.plm.admin.algorithm;

import com.plm.admin.config.ConfigChangedEvent;
import com.plm.platform.algorithm.dto.AlgorithmRegistrationRequest;
import com.plm.platform.algorithm.dto.AlgorithmRegistrationRequest.AlgoDef;
import com.plm.platform.algorithm.dto.AlgorithmRegistrationRequest.ParamDef;
import com.plm.platform.algorithm.dto.AlgorithmRegistrationRequest.TypeDef;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Upserts algorithm catalog rows pushed by services on startup. Source of
 * truth = {@code @AlgorithmBean}/{@code @AlgorithmType}/{@code @AlgorithmParam}
 * annotations in code. Existing rows are matched by stable keys
 * ({@code algorithm.code}, {@code algorithm_type.id}, {@code algorithm_parameter.algorithm_id+param_name})
 * so primary keys never change and instances keep their FK.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlgorithmRegistrationService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void registerCatalog(AlgorithmRegistrationRequest req) {
        int typeUpserts = upsertTypes(req.types() == null ? List.of() : req.types());
        int algoUpserts = 0;
        int paramUpserts = 0;
        for (AlgoDef alg : (req.algorithms() == null ? List.<AlgoDef>of() : req.algorithms())) {
            String algorithmId = upsertAlgorithm(alg);
            algoUpserts++;
            paramUpserts += upsertParameters(algorithmId, alg.parameters() == null ? List.of() : alg.parameters());
        }
        log.info("Algorithm catalog registered: types={}, algorithms={}, parameters={}",
            typeUpserts, algoUpserts, paramUpserts);

        eventPublisher.publishEvent(new ConfigChangedEvent("UPDATE", "ALGORITHM_REGISTRATION", "bulk"));
    }

    private int upsertTypes(List<TypeDef> types) {
        Set<String> seen = new HashSet<>();
        int n = 0;
        for (TypeDef t : types) {
            if (t.id() == null || t.id().isBlank()) continue;
            if (!seen.add(t.id())) continue;
            int rows = dsl.execute(
                "UPDATE algorithm_type SET name = ?, description = ?, java_interface = ? WHERE id = ?",
                t.name(), nullSafe(t.description()), nullSafe(t.javaInterface()), t.id());
            if (rows == 0) {
                dsl.execute(
                    "INSERT INTO algorithm_type (id, name, description, java_interface) VALUES (?,?,?,?)",
                    t.id(), t.name(), nullSafe(t.description()), nullSafe(t.javaInterface()));
            }
            n++;
        }
        return n;
    }

    private String upsertAlgorithm(AlgoDef alg) {
        if (alg.code() == null || alg.code().isBlank()) {
            throw new IllegalArgumentException("algorithm code required");
        }
        Optional<String> existingId = dsl.fetchOptional(
                "SELECT id FROM algorithm WHERE code = ?", alg.code())
            .map(r -> (String) r.get("id"));

        if (existingId.isPresent()) {
            String id = existingId.get();
            dsl.execute(
                "UPDATE algorithm SET algorithm_type_id = ?, name = ?, description = ?, " +
                "       handler_ref = ?, module_name = ?, domain_name = ? WHERE id = ?",
                alg.typeId(), alg.name(), nullSafe(alg.description()),
                nullSafe(alg.handlerRef()), nullSafe(alg.module()), nullSafe(alg.domain()), id);
            return id;
        }

        String id = (alg.id() == null || alg.id().isBlank())
            ? "alg-" + UUID.randomUUID().toString().substring(0, 8)
            : alg.id();
        dsl.execute(
            "INSERT INTO algorithm (id, algorithm_type_id, code, name, description, handler_ref, module_name, domain_name) " +
            "VALUES (?,?,?,?,?,?,?,?)",
            id, alg.typeId(), alg.code(), alg.name(), nullSafe(alg.description()),
            nullSafe(alg.handlerRef()), nullSafe(alg.module()), nullSafe(alg.domain()));
        return id;
    }

    private int upsertParameters(String algorithmId, List<ParamDef> params) {
        int n = 0;
        for (ParamDef p : params) {
            if (p.paramName() == null || p.paramName().isBlank()) continue;
            int rows = dsl.execute(
                "UPDATE algorithm_parameter SET param_label = ?, data_type = ?, required = ?, " +
                "       default_value = ?, display_order = ? " +
                "WHERE algorithm_id = ? AND param_name = ?",
                p.paramLabel(), p.dataType(), p.required() ? 1 : 0,
                nullSafe(p.defaultValue()), p.displayOrder(), algorithmId, p.paramName());
            if (rows == 0) {
                dsl.execute(
                    "INSERT INTO algorithm_parameter (id, algorithm_id, param_name, param_label, data_type, required, default_value, display_order) " +
                    "VALUES (?,?,?,?,?,?,?,?)",
                    "ap-" + UUID.randomUUID().toString().substring(0, 8),
                    algorithmId, p.paramName(), p.paramLabel(), p.dataType(),
                    p.required() ? 1 : 0, nullSafe(p.defaultValue()), p.displayOrder());
            }
            n++;
        }
        return n;
    }

    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }
}

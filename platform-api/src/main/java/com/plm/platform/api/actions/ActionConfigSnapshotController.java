package com.plm.platform.api.actions;

import com.plm.platform.config.dto.*;
import com.plm.platform.client.ServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Internal endpoint: serves full action + algorithm + permission snapshot for a service.
 * Called by psm-admin at snapshot-build time so psm-api gets all cross-cutting config from platform.
 * Transition guards are NOT here — they are admin config owned by psm-admin.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class ActionConfigSnapshotController {

    private final DSLContext dsl;
    private final ServiceClient serviceClient;

    record ActionConfigSnapshot(
        List<ActionConfig> actions,
        List<AlgorithmConfig> algorithms,
        List<PermissionConfig> permissions
    ) {}

    @GetMapping("/internal/config/actions")
    public ResponseEntity<ActionConfigSnapshot> getActionConfigSnapshot(
            @RequestParam(required = false) String serviceCode) {
        return ResponseEntity.ok(new ActionConfigSnapshot(
            buildActions(serviceCode),
            buildAlgorithms(serviceCode),
            buildPermissions(serviceCode)
        ));
    }

    private List<ActionConfig> buildActions(String svc) {
        List<Record> actions   = svc != null ? dsl.fetch("SELECT * FROM action WHERE service_code = ?", svc) : dsl.fetch("SELECT * FROM action");
        List<Record> params    = svc != null ? dsl.fetch("SELECT ap.* FROM action_parameter ap JOIN action a ON a.id = ap.action_id WHERE a.service_code = ?", svc) : dsl.fetch("SELECT * FROM action_parameter");
        List<Record> reqPerms  = svc != null ? dsl.fetch("SELECT ar.* FROM action_required_permission ar JOIN action a ON a.id = ar.action_id WHERE a.service_code = ?", svc) : dsl.fetch("SELECT * FROM action_required_permission");
        List<Record> guards    = svc != null ? dsl.fetch("SELECT ag.* FROM action_guard ag JOIN action a ON a.id = ag.action_id WHERE a.service_code = ?", svc) : dsl.fetch("SELECT * FROM action_guard");
        List<Record> wrappers  = svc != null ? dsl.fetch("SELECT aw.* FROM action_wrapper aw WHERE aw.service_code = ?", svc) : dsl.fetch("SELECT * FROM action_wrapper");

        Map<String, List<Record>> paramsByAction   = groupBy(params,   "action_id");
        Map<String, List<Record>> permsByAction    = groupBy(reqPerms, "action_id");
        Map<String, List<Record>> guardsByAction   = groupBy(guards,   "action_id");
        Map<String, List<Record>> wrappersByAction = groupBy(wrappers, "action_id");

        List<ActionConfig> result = new ArrayList<>();
        for (Record a : actions) {
            String actionId = str(a, "id");

            List<ActionParameterConfig> actionParams = new ArrayList<>();
            for (Record p : paramsByAction.getOrDefault(actionId, List.of())) {
                actionParams.add(new ActionParameterConfig(
                    str(p, "id"), actionId, str(p, "param_name"), str(p, "param_label"),
                    str(p, "data_type"), bool(p, "required"), str(p, "default_value"),
                    str(p, "allowed_values"), str(p, "widget_type"), str(p, "validation_regex"),
                    str(p, "min_value"), str(p, "max_value"), str(p, "visibility"),
                    intVal(p, "display_order"), str(p, "tooltip")
                ));
            }

            List<String> requiredPerms = new ArrayList<>();
            for (Record rp : permsByAction.getOrDefault(actionId, List.of()))
                requiredPerms.add(str(rp, "permission_code"));

            List<ActionGuardConfig> actionGuards = new ArrayList<>();
            for (Record g : guardsByAction.getOrDefault(actionId, List.of())) {
                actionGuards.add(new ActionGuardConfig(
                    str(g, "id"), str(g, "algorithm_instance_id"),
                    str(g, "effect"), intVal(g, "display_order"),
                    "ACTION", actionId, null, null, null
                ));
            }

            List<ActionWrapperConfig> actionWrappers = new ArrayList<>();
            for (Record w : wrappersByAction.getOrDefault(actionId, List.of())) {
                actionWrappers.add(new ActionWrapperConfig(
                    str(w, "id"), actionId, str(w, "algorithm_instance_id"),
                    intVal(w, "execution_order")
                ));
            }

            result.add(new ActionConfig(
                actionId, str(a, "action_code"), str(a, "scope"),
                str(a, "display_name"), str(a, "description"),
                str(a, "display_category"), intVal(a, "display_order"),
                str(a, "managed_with"), str(a, "handler_instance_id"),
                actionParams, requiredPerms, actionGuards, actionWrappers
            ));
        }
        return result;
    }

    private List<AlgorithmConfig> buildAlgorithms(String svc) {
        List<Record> algorithms  = svc != null ? dsl.fetch("SELECT * FROM algorithm WHERE service_code = ?", svc) : dsl.fetch("SELECT * FROM algorithm");
        List<Record> params      = svc != null ? dsl.fetch("SELECT ap.* FROM algorithm_parameter ap JOIN algorithm a ON a.id = ap.algorithm_id WHERE a.service_code = ?", svc) : dsl.fetch("SELECT * FROM algorithm_parameter");
        List<Record> instances   = svc != null ? dsl.fetch("SELECT * FROM algorithm_instance WHERE service_code = ?", svc) : dsl.fetch("SELECT * FROM algorithm_instance");
        List<Record> paramValues = svc != null ? dsl.fetch("SELECT pv.* FROM algorithm_instance_param_value pv JOIN algorithm_instance ai ON ai.id = pv.algorithm_instance_id WHERE ai.service_code = ?", svc) : dsl.fetch("SELECT * FROM algorithm_instance_param_value");

        Map<String, List<Record>> paramsByAlgo  = groupBy(params,  "algorithm_id");
        Map<String, List<Record>> instByAlgo    = groupBy(instances, "algorithm_id");
        Map<String, String>       paramNameById = new LinkedHashMap<>();
        for (Record p : params) paramNameById.put(str(p, "id"), str(p, "param_name"));

        Map<String, Map<String, String>> pvByInstance = new LinkedHashMap<>();
        for (Record pv : paramValues) {
            String instId    = str(pv, "algorithm_instance_id");
            String paramName = paramNameById.getOrDefault(str(pv, "algorithm_parameter_id"), str(pv, "algorithm_parameter_id"));
            pvByInstance.computeIfAbsent(instId, k -> new LinkedHashMap<>()).put(paramName, str(pv, "value"));
        }

        List<AlgorithmConfig> result = new ArrayList<>();
        for (Record alg : algorithms) {
            String algId = str(alg, "id");

            List<AlgorithmParameterConfig> algParams = new ArrayList<>();
            for (Record p : paramsByAlgo.getOrDefault(algId, List.of())) {
                algParams.add(new AlgorithmParameterConfig(
                    str(p, "id"), algId, str(p, "param_name"), str(p, "param_label"),
                    str(p, "data_type"), bool(p, "required"),
                    str(p, "default_value"), intVal(p, "display_order")
                ));
            }

            List<AlgorithmInstanceConfig> algInstances = new ArrayList<>();
            for (Record inst : instByAlgo.getOrDefault(algId, List.of())) {
                String instId = str(inst, "id");
                algInstances.add(new AlgorithmInstanceConfig(
                    instId, algId, str(inst, "name"),
                    pvByInstance.getOrDefault(instId, Map.of())
                ));
            }

            result.add(new AlgorithmConfig(
                algId, str(alg, "algorithm_type_id"), str(alg, "code"),
                str(alg, "name"), str(alg, "description"), str(alg, "handler_ref"),
                algParams, algInstances
            ));
        }
        return result;
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private List<PermissionConfig> buildPermissions(String svc) {
        try {
            // /internal/authorization/snapshot is S2S (X-Service-Secret); /permissions requires JWT
            Map snapshot = serviceClient.get("pno", "/api/pno/internal/authorization/snapshot", Map.class);
            if (snapshot == null) return List.of();
            List<Map> rows = (List<Map>) snapshot.get("permissions");
            if (rows == null) return List.of();
            List<PermissionConfig> result = new ArrayList<>();
            for (Map r : rows) {
                String permCode = (String) r.get("permission_code");
                if (svc != null) {
                    // filter by service if requested — permission_code convention: <SERVICE>_*
                    // fall through if no scope filter available; let consumers filter client-side
                }
                result.add(new PermissionConfig(
                    permCode,
                    (String) r.get("scope"),
                    (String) r.get("display_name"),
                    (String) r.get("description"),
                    r.get("display_order") instanceof Number n ? n.intValue() : 0
                ));
            }
            return result;
        } catch (Exception e) {
            log.warn("Failed to fetch permissions from pno-api: {}", e.getMessage());
            return List.of();
        }
    }

    private static Map<String, List<Record>> groupBy(List<Record> records, String key) {
        Map<String, List<Record>> map = new LinkedHashMap<>();
        for (Record r : records)
            map.computeIfAbsent(str(r, key), k -> new ArrayList<>()).add(r);
        return map;
    }

    private static String str(Record r, String col) {
        Object v = r.get(col);
        return v == null ? null : v.toString();
    }

    private static boolean bool(Record r, String col) {
        Object v = r.get(col);
        if (v == null) return false;
        if (v instanceof Boolean b) return b;
        return "true".equalsIgnoreCase(v.toString()) || "1".equals(v.toString());
    }

    private static int intVal(Record r, String col) {
        Object v = r.get(col);
        if (v == null) return 0;
        if (v instanceof Number n) return n.intValue();
        try { return Integer.parseInt(v.toString()); } catch (NumberFormatException e) { return 0; }
    }
}

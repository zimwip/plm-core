package com.plm.platform.api.transaction;

import com.plm.platform.PlatformPaths;
import com.plm.platform.api.environment.EnvironmentRegistry;
import com.plm.platform.client.ServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Federates transaction operations across all services that declared the
 * "transaction" feature at registration time. Uses the same fan-out pattern
 * as {@code UiPluginsClient} — services that are down or have no open
 * transactions return silently.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionFederatorClient {

    private static final ParameterizedTypeReference<List<Map<String, Object>>> TX_LIST =
            new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<Map<String, Object>> TX_MAP =
            new ParameterizedTypeReference<>() {};

    private final EnvironmentRegistry environmentRegistry;
    private final ServiceClient serviceClient;

    public List<Map<String, Object>> fetchOpenTransactions() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (String serviceCode : environmentRegistry.servicesWithFeature("transaction")) {
            String path = PlatformPaths.internalPath(serviceCode, "/transactions?status=OPEN");
            try {
                List<Map<String, Object>> txs = serviceClient.get(serviceCode, path, TX_LIST);
                if (txs != null) result.addAll(txs);
            } catch (Exception e) {
                log.warn("Skipping transactions from {}: {}", serviceCode, upstreamError(e));
            }
        }
        return result;
    }

    public Map<String, Object> getTransaction(String serviceCode, String txId) {
        return delegate(serviceCode, () -> {
            String path = PlatformPaths.internalPath(serviceCode, "/transactions/" + txId);
            return serviceClient.get(serviceCode, path, TX_MAP);
        });
    }

    public Map<String, Object> openTransaction(String serviceCode) {
        return delegate(serviceCode, () -> {
            String path = PlatformPaths.internalPath(serviceCode, "/transactions");
            return serviceClient.post(serviceCode, path, null, TX_MAP);
        });
    }

    public Map<String, Object> commit(String serviceCode, String txId, Object body) {
        return delegate(serviceCode, () -> {
            String path = PlatformPaths.internalPath(serviceCode, "/transactions/" + txId + "/commit");
            return serviceClient.post(serviceCode, path, body, TX_MAP);
        });
    }

    public Map<String, Object> rollback(String serviceCode, String txId) {
        return delegate(serviceCode, () -> {
            String path = PlatformPaths.internalPath(serviceCode, "/transactions/" + txId + "/rollback");
            return serviceClient.post(serviceCode, path, null, TX_MAP);
        });
    }

    public Map<String, Object> addItem(String serviceCode, String txId, Object body) {
        return delegate(serviceCode, () -> {
            String path = PlatformPaths.internalPath(serviceCode, "/transactions/" + txId + "/items");
            return serviceClient.post(serviceCode, path, body, TX_MAP);
        });
    }

    public Map<String, Object> removeItems(String serviceCode, String txId, Object body) {
        return delegate(serviceCode, () -> {
            String path = PlatformPaths.internalPath(serviceCode, "/transactions/" + txId + "/items");
            return serviceClient.exchangeParameterized(serviceCode, path, HttpMethod.DELETE, body, TX_MAP);
        });
    }

    private Map<String, Object> delegate(String serviceCode, java.util.concurrent.Callable<Map<String, Object>> call) {
        try {
            return call.call();
        } catch (Exception e) {
            String detail = upstreamError(e);
            log.warn("Transaction op failed on {}: {}", serviceCode, detail);
            throw new com.plm.platform.api.shared.PlmFunctionalException("[" + serviceCode + "] " + detail, 502);
        }
    }

    private static String upstreamError(Exception e) {
        if (e instanceof HttpStatusCodeException hsce) {
            String body = hsce.getResponseBodyAsString();
            return hsce.getStatusCode() + (body.isBlank() ? "" : " — " + body);
        }
        return e.getMessage();
    }
}

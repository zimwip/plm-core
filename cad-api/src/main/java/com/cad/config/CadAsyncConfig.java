package com.cad.config;

import com.cad.security.CadSecurityContext;
import com.cad.security.CadUserContext;
import com.plm.platform.client.ServiceClientTokenContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskDecorator;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class CadAsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("cad-import-");
        executor.setTaskDecorator(new RequestContextPropagatingDecorator());
        executor.initialize();
        return executor;
    }

    private static class RequestContextPropagatingDecorator implements TaskDecorator {
        @Override
        public Runnable decorate(Runnable runnable) {
            RequestAttributes requestAttrs = RequestContextHolder.getRequestAttributes();
            // Capture user identity now — the HttpServletRequest is recycled after the HTTP
            // response is sent. We use the delegated-context path (X-Service-Secret +
            // X-PLM-User-Id) instead of forwarding the JWT: forward JWTs have a 60s TTL
            // which expires long before a large import job finishes.
            CadUserContext cadCtx = CadSecurityContext.getOrNull();
            final ServiceClientTokenContext.DelegatedContext delegated = cadCtx == null ? null
                : new ServiceClientTokenContext.DelegatedContext(
                    cadCtx.getUserId(), cadCtx.getUsername(), cadCtx.getRoleIds(),
                    cadCtx.isAdmin(), cadCtx.getProjectSpaceId());
            return () -> {
                try {
                    if (requestAttrs != null) RequestContextHolder.setRequestAttributes(requestAttrs);
                    if (delegated != null) ServiceClientTokenContext.setDelegated(delegated);
                    if (cadCtx != null) CadSecurityContext.set(cadCtx);
                    runnable.run();
                } finally {
                    RequestContextHolder.resetRequestAttributes();
                    ServiceClientTokenContext.clear();
                    CadSecurityContext.clear();
                }
            };
        }
    }
}

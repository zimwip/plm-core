package com.cad.config;

import com.cad.security.CadSecurityContext;
import com.cad.security.CadUserContext;
import com.plm.platform.client.OperationTokenContext;
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
            // Capture auth context now — the HttpServletRequest is recycled after the HTTP
            // response is sent. Forward JWT TTL is short (60s); long-running imports should
            // route S2S calls to /internal/** paths (secret-only auth, no JWT expiry issue).
            CadUserContext cadCtx = CadSecurityContext.getOrNull();
            String jwt   = ServiceClientTokenContext.get();
            String ps    = ServiceClientTokenContext.getProjectSpace();
            String jobId = OperationTokenContext.get();
            return () -> {
                try {
                    if (requestAttrs != null) RequestContextHolder.setRequestAttributes(requestAttrs);
                    if (jwt != null) ServiceClientTokenContext.set(jwt);
                    if (ps != null) ServiceClientTokenContext.setProjectSpace(ps);
                    if (jobId != null) OperationTokenContext.set(jobId);
                    if (cadCtx != null) CadSecurityContext.set(cadCtx);
                    runnable.run();
                } finally {
                    RequestContextHolder.resetRequestAttributes();
                    ServiceClientTokenContext.clear();
                    OperationTokenContext.clear();
                    CadSecurityContext.clear();
                }
            };
        }
    }
}

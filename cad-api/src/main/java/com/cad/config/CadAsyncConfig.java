package com.cad.config;

import com.cad.security.CadSecurityContext;
import com.cad.security.CadUserContext;
import com.plm.platform.spe.client.ServiceClientTokenContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskDecorator;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

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
            // Capture from the submitting HTTP thread before it can be recycled
            RequestAttributes requestAttrs = RequestContextHolder.getRequestAttributes();
            CadUserContext cadCtx = CadSecurityContext.getOrNull();
            // Extract auth token as a String now — the HttpServletRequest will be
            // recycled by Tomcat after the HTTP response is sent, making header reads
            // return null in the async thread.
            String authToken = null;
            if (requestAttrs instanceof ServletRequestAttributes sra) {
                try { authToken = sra.getRequest().getHeader("Authorization"); } catch (Exception ignored) {}
            }
            final String capturedAuth = authToken;
            return () -> {
                try {
                    if (requestAttrs != null) RequestContextHolder.setRequestAttributes(requestAttrs);
                    if (capturedAuth != null) ServiceClientTokenContext.set(capturedAuth);
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

package com.plm.search.security;

import com.plm.platform.auth.PlmAuthContextBinder;
import com.plm.platform.auth.PlmPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class SearchAuthContextBinder implements PlmAuthContextBinder {

    private static final ThreadLocal<PlmPrincipal> CTX = new ThreadLocal<>();

    @Override
    public void bind(PlmPrincipal principal, HttpServletRequest request) {
        CTX.set(principal);
    }

    @Override
    public void clear() {
        CTX.remove();
    }

    public static PlmPrincipal current() {
        return CTX.get();
    }
}

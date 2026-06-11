package com.dav.webdav;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

/**
 * Registers the WebDAV filter just after PlmAuthFilter (HIGHEST_PRECEDENCE+10)
 * so every DAV request is already authenticated and the forward JWT is
 * captured in ServiceClientTokenContext before the tree is walked.
 */
@Configuration
public class WebDavFilterConfig {

    @Bean
    public FilterRegistrationBean<WebDavFilter> webDavFilterRegistration(
            DavTreeService tree, DstStreamClient streamClient) {
        FilterRegistrationBean<WebDavFilter> reg =
            new FilterRegistrationBean<>(new WebDavFilter(tree, streamClient));
        reg.addUrlPatterns("/*");
        reg.setOrder(Ordered.HIGHEST_PRECEDENCE + 50);
        return reg;
    }
}

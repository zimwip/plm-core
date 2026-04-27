package com.plm.wsgateway.config;

import com.plm.wsgateway.handler.PlmWebSocketHandler;
import com.plm.wsgateway.security.JwtVerifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;
import java.util.Optional;

/**
 * Raw WebSocket configuration (no STOMP, no SockJS).
 *
 * The forward JWT arrives in the Authorization header, set by spe-api's
 * AuthenticationFilter before proxying to ws-gateway.
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebSocketConfig.class);

    private final PlmWebSocketHandler handler;
    private final JwtVerifier jwtVerifier;

    public WebSocketConfig(PlmWebSocketHandler handler, JwtVerifier jwtVerifier) {
        this.handler = handler;
        this.jwtVerifier = jwtVerifier;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(handler, "/")
                .addInterceptors(new JwtHandshakeInterceptor())
                .setAllowedOriginPatterns("*");
    }

    /**
     * Extracts userId and projectSpaceId from the forward JWT during the
     * WebSocket upgrade handshake and stores them as session attributes.
     */
    private class JwtHandshakeInterceptor implements HandshakeInterceptor {

        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                       WebSocketHandler wsHandler, Map<String, Object> attributes) {
            String authz = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            String token = null;
            if (authz != null && authz.startsWith("Bearer ")) {
                token = authz.substring("Bearer ".length()).trim();
            }
            if (token == null || token.isBlank()) {
                log.warn("WS handshake rejected: no Authorization header");
                return false;
            }

            Optional<JwtVerifier.UserInfo> userInfo = jwtVerifier.verify(token);
            if (userInfo.isEmpty()) {
                log.warn("WS handshake rejected: invalid JWT");
                return false;
            }

            attributes.put("userId", userInfo.get().userId());
            attributes.put("projectSpaceId", userInfo.get().projectSpaceId());
            attributes.put("username", userInfo.get().username());
            return true;
        }

        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Exception exception) {
            // no-op
        }
    }
}

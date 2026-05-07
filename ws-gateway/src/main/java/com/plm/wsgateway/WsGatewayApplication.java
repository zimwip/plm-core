package com.plm.wsgateway;

import com.plm.platform.PlatformService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WsGatewayApplication extends PlatformService {

    public static void main(String[] args) {
        SpringApplication.run(WsGatewayApplication.class, args);
    }
}

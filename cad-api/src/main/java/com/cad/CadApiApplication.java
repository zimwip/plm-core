package com.cad;

import com.plm.platform.PlatformService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CadApiApplication extends PlatformService {
    public static void main(String[] args) {
        SpringApplication.run(CadApiApplication.class, args);
    }
}

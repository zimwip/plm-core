package com.plm;

import com.plm.platform.PlatformService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PlmApplication extends PlatformService {
    public static void main(String[] args) {
        SpringApplication.run(PlmApplication.class, args);
    }
}

package com.dst;

import com.plm.platform.PlatformService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DstApplication extends PlatformService {
    public static void main(String[] args) {
        SpringApplication.run(DstApplication.class, args);
    }
}

package com.pno;

import com.plm.platform.PlatformService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PnoApplication extends PlatformService {
    public static void main(String[] args) {
        SpringApplication.run(PnoApplication.class, args);
    }
}

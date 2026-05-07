package com.spe;

import com.plm.platform.PlatformService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SpeApplication extends PlatformService {
    public static void main(String[] args) {
        SpringApplication.run(SpeApplication.class, args);
    }
}

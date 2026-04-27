package com.plm.admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PsmAdminApplication {
    public static void main(String[] args) {
        SpringApplication.run(PsmAdminApplication.class, args);
    }
}

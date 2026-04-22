package com.pno;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PnoApplication {
    public static void main(String[] args) {
        SpringApplication.run(PnoApplication.class, args);
    }
}

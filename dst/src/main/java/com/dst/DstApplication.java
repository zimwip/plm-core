package com.dst;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DstApplication {
    public static void main(String[] args) {
        SpringApplication.run(DstApplication.class, args);
    }
}

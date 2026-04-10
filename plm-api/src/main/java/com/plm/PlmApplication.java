package com.plm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PlmApplication {
    public static void main(String[] args) {
        SpringApplication.run(PlmApplication.class, args);
    }
}

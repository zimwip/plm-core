package com.spe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SpeApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpeApplication.class, args);
    }
}

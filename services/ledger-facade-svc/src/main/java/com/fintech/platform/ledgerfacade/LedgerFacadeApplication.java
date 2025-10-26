package com.fintech.platform.ledgerfacade;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class LedgerFacadeApplication {

    public static void main(String[] args) {
        SpringApplication.run(LedgerFacadeApplication.class, args);
    }
}

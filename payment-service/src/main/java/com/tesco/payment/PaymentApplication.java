// Entry point of the Spring Boot app — `java -jar payment-service.jar` runs this main()
package com.tesco.payment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// @SpringBootApplication enables component scan + auto-config (RabbitMQ, JPA, web auto-wire)
@SpringBootApplication
public class PaymentApplication {
    public static void main(String[] args) {
        // Starts the embedded Tomcat + RabbitMQ listeners + JPA context
        SpringApplication.run(PaymentApplication.class, args);
    }
}

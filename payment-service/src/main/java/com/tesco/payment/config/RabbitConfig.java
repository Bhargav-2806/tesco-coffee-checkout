// Declares the two queues Spring Boot uses (order.created in, payment.result out)
package com.tesco.payment.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// @Configuration tells Spring to treat this class as a source of @Bean definitions
@Configuration
public class RabbitConfig {

    // These names must match exactly what go-api publishes/consumes
    public static final String ORDER_CREATED_QUEUE  = "order.created";
    public static final String PAYMENT_RESULT_QUEUE = "payment.result";

    // Declare order.created as a durable queue (survives broker restarts)
    @Bean
    public Queue orderCreatedQueue() {
        return new Queue(ORDER_CREATED_QUEUE, true);
    }

    // Declare payment.result as a durable queue
    @Bean
    public Queue paymentResultQueue() {
        return new Queue(PAYMENT_RESULT_QUEUE, true);
    }

    // Converts POJOs <-> JSON bytes so we don't deal with raw byte[] in consumers/publishers
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}

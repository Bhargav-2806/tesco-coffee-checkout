// Core business logic: consumes order.created, runs mock logic, writes DB, publishes payment.result
package com.tesco.payment.service;

import com.tesco.payment.config.RabbitConfig;
import com.tesco.payment.entity.PaymentRecord;
import com.tesco.payment.message.OrderCreatedMessage;
import com.tesco.payment.message.PaymentResultMessage;
import com.tesco.payment.repository.PaymentRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

// @Service marks this class as a Spring-managed component (Spring creates one instance and injects it)
@Service
public class PaymentProcessor {

    private static final Logger log = LoggerFactory.getLogger(PaymentProcessor.class);

    // Dependencies are injected via constructor — easier to test than field injection
    private final PaymentRepository repository;
    private final RabbitTemplate rabbit;

    public PaymentProcessor(PaymentRepository repository, RabbitTemplate rabbit) {
        this.repository = repository;
        this.rabbit = rabbit;
    }

    // @RabbitListener auto-subscribes this method to the order.created queue
    // Spring deserializes the JSON body into OrderCreatedMessage and calls handle(...)
    @RabbitListener(queues = RabbitConfig.ORDER_CREATED_QUEUE)
    public void handle(OrderCreatedMessage msg) {
        log.info("received order {} for £{}", msg.getOrderId(), msg.getAmount());

        // Mock payment rule: card ending 0000 -> DECLINED, any other last-4 -> APPROVED
        String status = "0000".equals(msg.getCardLast4()) ? "DECLINED" : "APPROVED";

        // Persist the payment attempt to Postgres so we have an audit record either way
        repository.save(new PaymentRecord(
                msg.getOrderId(),
                msg.getAmount(),
                msg.getCurrency(),
                msg.getCardLast4(),
                status
        ));

        // Publish the result back on payment.result — go-api picks it up and updates its memory store
        rabbit.convertAndSend(RabbitConfig.PAYMENT_RESULT_QUEUE,
                new PaymentResultMessage(msg.getOrderId(), status));

        log.info("order {} -> {}", msg.getOrderId(), status);
    }
}

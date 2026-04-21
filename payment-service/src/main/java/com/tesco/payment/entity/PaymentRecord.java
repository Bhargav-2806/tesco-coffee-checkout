// JPA entity mapped to the "payments" table defined in db/init.sql
package com.tesco.payment.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

// @Entity marks this class as a persistent type; @Table chooses the SQL table name
@Entity
@Table(name = "payments")
public class PaymentRecord {

    // Primary key — database generates a UUID for us automatically
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "order_id", nullable = false, unique = true)
    private String orderId; // the UUID we received in the RabbitMQ message

    @Column(nullable = false)
    private BigDecimal amount; // using BigDecimal for money — no float rounding errors

    @Column(nullable = false, length = 3)
    private String currency; // always "GBP" in this project

    @Column(name = "card_last_four", length = 4)
    private String cardLastFour; // last 4 digits only — never store the full card

    @Column(nullable = false)
    private String status; // "APPROVED" or "DECLINED"

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt; // when we processed the payment

    // No-arg constructor required by JPA/Hibernate
    public PaymentRecord() {}

    // Convenience constructor used from PaymentProcessor
    public PaymentRecord(String orderId, BigDecimal amount, String currency, String cardLastFour, String status) {
        this.orderId = orderId;
        this.amount = amount;
        this.currency = currency;
        this.cardLastFour = cardLastFour;
        this.status = status;
        this.createdAt = OffsetDateTime.now();
    }

    // Getters — Spring/Jackson use these via reflection
    public UUID getId()               { return id; }
    public String getOrderId()        { return orderId; }
    public BigDecimal getAmount()     { return amount; }
    public String getCurrency()       { return currency; }
    public String getCardLastFour()   { return cardLastFour; }
    public String getStatus()         { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}

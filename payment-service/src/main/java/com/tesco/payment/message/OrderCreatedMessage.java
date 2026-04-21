// POJO that matches the JSON shape Go publishes onto order.created
package com.tesco.payment.message;

import java.math.BigDecimal;

// Plain Java class — Jackson maps JSON fields to these setters automatically
public class OrderCreatedMessage {
    private String orderId;
    private String productName;
    private BigDecimal amount;
    private String currency;
    private String cardLast4;

    public OrderCreatedMessage() {} // required no-arg constructor for Jackson

    // Getters + setters — field names MUST match the JSON keys ("orderId", "cardLast4", etc.)
    public String getOrderId()              { return orderId; }
    public void setOrderId(String v)        { this.orderId = v; }
    public String getProductName()          { return productName; }
    public void setProductName(String v)    { this.productName = v; }
    public BigDecimal getAmount()           { return amount; }
    public void setAmount(BigDecimal v)     { this.amount = v; }
    public String getCurrency()             { return currency; }
    public void setCurrency(String v)       { this.currency = v; }
    public String getCardLast4()            { return cardLast4; }
    public void setCardLast4(String v)      { this.cardLast4 = v; }
}

// POJO matching the JSON shape Go expects on payment.result
package com.tesco.payment.message;

public class PaymentResultMessage {
    private String orderId;
    private String status; // "APPROVED" or "DECLINED"

    public PaymentResultMessage() {} // required by Jackson

    // Convenience constructor used by PaymentProcessor
    public PaymentResultMessage(String orderId, String status) {
        this.orderId = orderId;
        this.status  = status;
    }

    public String getOrderId()         { return orderId; }
    public void setOrderId(String v)   { this.orderId = v; }
    public String getStatus()          { return status; }
    public void setStatus(String v)    { this.status = v; }
}

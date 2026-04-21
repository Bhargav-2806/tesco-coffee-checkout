// Package models holds the data shapes shared across handlers/clients
package models

// CheckoutRequest is the JSON body React sends to POST /api/checkout
type CheckoutRequest struct {
	ProductID      string  `json:"productId"`      // e.g. "prod-001"
	ProductName    string  `json:"productName"`    // human-readable name shown on the confirmation page
	Amount         float64 `json:"amount"`         // price charged in GBP
	CardholderName string  `json:"cardholderName"` // name typed on the payment form
	CardNumber     string  `json:"cardNumber"`     // raw 16-digit card number (we only use the last 4)
	Expiry         string  `json:"expiry"`         // MM/YY string (not used by mock logic)
	CVV            string  `json:"cvv"`            // 3-digit code (not stored)
	CardLast4      string  `json:"cardLast4"`      // last 4 digits used by the mock logic in Spring Boot
}

// OrderCreatedMessage is what Go publishes onto the "order.created" queue for Spring Boot to consume
type OrderCreatedMessage struct {
	OrderID     string  `json:"orderId"`     // UUID we generate
	ProductName string  `json:"productName"` // carried for logging / DB storage
	Amount      float64 `json:"amount"`      // carried so Spring Boot can persist it
	Currency    string  `json:"currency"`    // always "GBP" for now
	CardLast4   string  `json:"cardLast4"`   // the only card detail forwarded (mock logic reads this)
}

// PaymentResultMessage is what Spring Boot publishes onto "payment.result" and Go consumes
type PaymentResultMessage struct {
	OrderID string `json:"orderId"` // UUID to match with the pending order
	Status  string `json:"status"`  // "APPROVED" or "DECLINED"
}

// StatusResponse is the JSON body returned by GET /api/order/:id/status
type StatusResponse struct {
	OrderID string `json:"orderId"`
	Status  string `json:"status"` // "PENDING" | "APPROVED" | "DECLINED" | "UNKNOWN"
}

// CheckoutResponse is the JSON body returned by POST /api/checkout
type CheckoutResponse struct {
	OrderID string `json:"orderId"`
	Status  string `json:"status"` // always "PENDING" when returned from here
}

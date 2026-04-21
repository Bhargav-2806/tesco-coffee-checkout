// Package handlers holds the HTTP endpoint functions
package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"tesco/go-api/clients"
	"tesco/go-api/models"
	"tesco/go-api/store"
)

// Checkout returns a gin.HandlerFunc bound to our rabbit client + memory store
// This "factory" pattern is how we inject dependencies into Gin handlers
func Checkout(rabbit *clients.Rabbit, orders *store.OrderStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Parse JSON body into our CheckoutRequest struct
		var req models.CheckoutRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
			return
		}

		// Generate a fresh UUID to identify this order end-to-end
		orderID := uuid.NewString()

		// Mark the order as PENDING immediately so the status endpoint has something to return
		orders.Set(orderID, "PENDING")

		// Build the message Spring Boot will consume
		msg := models.OrderCreatedMessage{
			OrderID:     orderID,
			ProductName: req.ProductName,
			Amount:      req.Amount,
			Currency:    "GBP",
			CardLast4:   req.CardLast4,
		}

		// Publish to RabbitMQ — if this fails the order will stay PENDING forever
		if err := rabbit.PublishOrderCreated(msg); err != nil {
			log.Printf("publish failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not queue order"})
			return
		}

		log.Printf("order %s published to %s", orderID, clients.OrderCreatedQueue)

		// Return orderId immediately — React will poll /status to learn the result
		c.JSON(http.StatusOK, models.CheckoutResponse{
			OrderID: orderID,
			Status:  "PENDING",
		})
	}
}

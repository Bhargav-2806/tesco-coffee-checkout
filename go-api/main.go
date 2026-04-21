// Package main is the entry point of the Go API binary
package main

import (
	"encoding/json"
	"log"
	"os"

	"github.com/gin-gonic/gin"

	"tesco/go-api/clients"
	"tesco/go-api/handlers"
	"tesco/go-api/models"
	"tesco/go-api/store"
)

// envOrDefault returns the env variable if set, otherwise the provided default
func envOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func main() {
	// Read config from environment variables with safe defaults for local dev
	rabbitURL := envOrDefault("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
	port := envOrDefault("PORT", "8080")

	// Create our in-memory order store (used by both the checkout and status handlers)
	orders := store.New()

	// Connect to RabbitMQ (retries internally until broker accepts connections)
	rabbit, err := clients.Connect(rabbitURL)
	if err != nil {
		log.Fatalf("rabbitmq connect failed: %v", err)
	}
	defer rabbit.Close() // close the connection when main() exits

	// Start background consumer — updates the store whenever Spring Boot publishes a result
	err = rabbit.ConsumePaymentResults(func(body []byte) {
		var msg models.PaymentResultMessage
		if err := json.Unmarshal(body, &msg); err != nil {
			log.Printf("bad result message: %v", err)
			return
		}
		orders.Set(msg.OrderID, msg.Status)
		log.Printf("order %s -> %s", msg.OrderID, msg.Status)
	})
	if err != nil {
		log.Fatalf("consumer start failed: %v", err)
	}

	// Create a Gin router with default logger + recovery middleware
	r := gin.Default()

	// Health probe — doesn't touch any dependencies
	r.GET("/health", handlers.Health)

	// Group all business routes under /api for nginx/ingress to proxy cleanly
	api := r.Group("/api")
	{
		api.POST("/checkout", handlers.Checkout(rabbit, orders))
		api.GET("/order/:id/status", handlers.Status(orders))
	}

	log.Printf("go-api listening on :%s", port)
	// Run blocks forever, serving HTTP on 0.0.0.0:PORT
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

// Module name used for local imports (e.g. "tesco/go-api/store")
module tesco/go-api

// Minimum Go version required to build this module
go 1.22

require (
	// Gin is a lightweight HTTP web framework (routing + JSON helpers)
	github.com/gin-gonic/gin v1.10.0
	// UUID generator for creating orderIds
	github.com/google/uuid v1.6.0
	// Official RabbitMQ AMQP 0.9.1 client library
	github.com/rabbitmq/amqp091-go v1.10.0
)

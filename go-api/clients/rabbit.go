// Package clients wraps RabbitMQ so handlers don't see raw AMQP code
package clients

import (
	"encoding/json"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Queue names shared with Spring Boot — both services must agree on these exactly
const (
	OrderCreatedQueue  = "order.created"  // Go publishes, Spring Boot consumes
	PaymentResultQueue = "payment.result" // Spring Boot publishes, Go consumes
)

// Rabbit wraps the long-lived connection + channel we keep open
type Rabbit struct {
	conn    *amqp.Connection // TCP connection to the RabbitMQ broker
	channel *amqp.Channel    // multiplexed logical channel used for all operations
}

// Connect opens a connection, declares both queues, and returns a ready-to-use client
// It retries a few times because RabbitMQ usually starts a bit later than this container does
func Connect(url string) (*Rabbit, error) {
	var conn *amqp.Connection
	var err error
	// Retry loop — wait up to ~30 seconds for RabbitMQ to accept connections
	for i := 0; i < 15; i++ {
		conn, err = amqp.Dial(url)
		if err == nil {
			break
		}
		log.Printf("rabbitmq not ready yet (%v) — retrying in 2s", err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		return nil, err
	}

	// A channel is a lightweight virtual connection within the real TCP connection
	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}

	// Declare both queues idempotently — safe to call even if they already exist
	// durable=true means the queue survives a broker restart
	for _, q := range []string{OrderCreatedQueue, PaymentResultQueue} {
		_, err = ch.QueueDeclare(q, true, false, false, false, nil)
		if err != nil {
			return nil, err
		}
	}

	log.Println("rabbitmq connected and queues declared")
	return &Rabbit{conn: conn, channel: ch}, nil
}

// PublishOrderCreated serialises the message to JSON and puts it on the order.created queue
func (r *Rabbit) PublishOrderCreated(payload any) error {
	// Marshal the struct to a JSON byte slice
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	// Publish with empty exchange => uses the default direct exchange,
	// routing key = queue name => message lands directly in that queue
	return r.channel.Publish("", OrderCreatedQueue, false, false, amqp.Publishing{
		ContentType:  "application/json",
		Body:         body,
		DeliveryMode: amqp.Persistent, // write message to disk so a broker restart doesn't lose it
	})
}

// ConsumePaymentResults starts a goroutine that forwards each payment.result message to the handler
func (r *Rabbit) ConsumePaymentResults(handler func([]byte)) error {
	// Register ourselves as a consumer on the payment.result queue
	msgs, err := r.channel.Consume(PaymentResultQueue, "", true, false, false, false, nil)
	if err != nil {
		return err
	}
	// Run the receive loop in the background — main() keeps running
	go func() {
		for m := range msgs {
			handler(m.Body)
		}
	}()
	return nil
}

// Close shuts down the channel and connection cleanly on process exit
func (r *Rabbit) Close() {
	if r.channel != nil {
		r.channel.Close()
	}
	if r.conn != nil {
		r.conn.Close()
	}
}

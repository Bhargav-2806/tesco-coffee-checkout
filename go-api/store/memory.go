// Package store keeps order status in memory (simpler replacement for Redis)
package store

import "sync"

// OrderStore is a thread-safe map of orderId -> status
type OrderStore struct {
	mu     sync.RWMutex      // RWMutex lets many reads happen in parallel but only one write at a time
	orders map[string]string // key: orderId (UUID), value: "PENDING" | "APPROVED" | "DECLINED"
}

// New returns an empty store ready to use
func New() *OrderStore {
	return &OrderStore{orders: make(map[string]string)}
}

// Set writes or overwrites a status for an orderId
func (s *OrderStore) Set(orderID, status string) {
	s.mu.Lock()         // take exclusive write lock
	defer s.mu.Unlock() // released when function returns
	s.orders[orderID] = status
}

// Get returns the status for an orderId, or "UNKNOWN" if it doesn't exist
func (s *OrderStore) Get(orderID string) string {
	s.mu.RLock()         // shared read lock
	defer s.mu.RUnlock() // released when function returns
	if status, ok := s.orders[orderID]; ok {
		return status
	}
	return "UNKNOWN"
}

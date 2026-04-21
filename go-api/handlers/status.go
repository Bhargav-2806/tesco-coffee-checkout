package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"tesco/go-api/models"
	"tesco/go-api/store"
)

// Status returns a handler that looks up the current status for the orderId in the URL
func Status(orders *store.OrderStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		// ":id" is pulled from the route pattern registered in main.go
		orderID := c.Param("id")
		// Read the current status (or "UNKNOWN" if the id isn't in the map)
		status := orders.Get(orderID)
		c.JSON(http.StatusOK, models.StatusResponse{
			OrderID: orderID,
			Status:  status,
		})
	}
}

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Health is a trivial liveness probe used by Docker/Kubernetes to check the container is alive
// Returns 200 OK with {"status":"ok"} — no dependencies are checked here
func Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

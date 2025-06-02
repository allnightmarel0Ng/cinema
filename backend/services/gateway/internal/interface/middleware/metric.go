package middleware

import (
	"time"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/metrics"
	"github.com/gin-gonic/gin"
)

func NewMetric() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		metrics.RecordResponseTime(c.Request.Context(), time.Since(start), c.FullPath())
	}
}

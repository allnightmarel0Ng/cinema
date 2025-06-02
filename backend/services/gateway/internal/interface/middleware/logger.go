package middleware

import (
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/tracing"
	"github.com/gin-gonic/gin"
	"github.com/improbable-eng/go-httpwares/logging/logrus/ctxlogrus"
	"github.com/sirupsen/logrus"
)

func NewLogger(logger *logrus.Entry) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := ctxlogrus.ToContext(c.Request.Context(), logger.WithField("trace_id", tracing.GetTraceID(c.Request.Context())))
		c.Request = c.Request.WithContext(ctx)
	}
}

package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/improbable-eng/go-httpwares/logging/logrus/ctxlogrus"
	"github.com/sirupsen/logrus"
	"go.opentelemetry.io/otel/trace"
)

func NewLogger(logger *logrus.Entry) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := ctxlogrus.ToContext(c.Request.Context(), logger.WithField("request_id", trace.SpanFromContext(c.Request.Context()).SpanContext().TraceID()))
		c.Request = c.Request.WithContext(ctx)
	}
}

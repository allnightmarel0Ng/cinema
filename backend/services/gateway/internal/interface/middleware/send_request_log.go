package middleware

import (
	"time"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/tracing"
	"github.com/gin-gonic/gin"
	"github.com/improbable-eng/go-httpwares/logging/logrus/ctxlogrus"
	"go.opentelemetry.io/otel/trace"
)

func NewSendRequestLog(requestLogs repositories.RequestLogs, tracer trace.Tracer) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		fullPath := c.FullPath()
		c.Next()

		user, _ := UserFromContext(c.Request.Context())
		logger := ctxlogrus.Extract(c.Request.Context())

		go func() {
			ctx, span := tracer.Start(c.Request.Context(), "request_log")
			defer span.End()

			requestLog := &entities.RequestLog{
				TraceID:        tracing.GetTraceID(ctx),
				Timestamp:      time.Now(),
				Method:         c.Request.Method,
				Path:           c.Request.URL.Path,
				NormalizedPath: fullPath,
				StatusCode:     c.Writer.Status(),
				StatusClass:    getStatusClass(c.Writer.Status()),
				DurationMs:     int(time.Since(start).Milliseconds()),
				UserID:         user.ID,
			}

			if err := requestLogs.Insert(ctx, requestLog); err != nil {
				logger.Warnf("unable to send request log to database %s", err.Error())
			}
		}()
	}
}

func getStatusClass(status int) string {
	switch {
	case status >= 200 && status < 300:
		return "2xx"
	case status >= 300 && status < 400:
		return "3xx"
	case status >= 400 && status < 500:
		return "4xx"
	case status >= 500:
		return "5xx"
	default:
		return "other"
	}
}

package middleware

import (
	"context"
	"time"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/tracing"
	"github.com/gin-gonic/gin"
	"github.com/improbable-eng/go-httpwares/logging/logrus/ctxlogrus"
)

func NewSendRequestLog(requestLogs repositories.RequestLogs) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()

		ctx := context.WithoutCancel(c.Request.Context())
		user, _ := UserFromContext(ctx)

		requestLog := &entities.RequestLog{
			TraceID:        tracing.GetTraceID(ctx),
			Timestamp:      time.Now(),
			Method:         c.Request.Method,
			Path:           c.Request.URL.Path,
			NormalizedPath: c.FullPath(),
			StatusCode:     c.Writer.Status(),
			StatusClass:    getStatusClass(c.Writer.Status()),
			DurationMs:     int(time.Since(start).Milliseconds()),
			UserID:         user.ID,
		}

		go func() {
			if err := requestLogs.Insert(ctx, requestLog); err != nil {
				ctxlogrus.Extract(ctx).Warnf("unable to send request log to database %s", err.Error())
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

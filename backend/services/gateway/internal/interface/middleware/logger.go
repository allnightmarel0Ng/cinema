package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/improbable-eng/go-httpwares/logging/logrus/ctxlogrus"
	"github.com/sirupsen/logrus"
)

func NewLogger(logger *logrus.Entry) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := ctxlogrus.ToContext(c.Request.Context(), logger)
		c.Request = c.Request.WithContext(ctx)
	}
}

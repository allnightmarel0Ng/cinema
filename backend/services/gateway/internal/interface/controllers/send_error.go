package controllers

import (
	"errors"
	"net/http"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/clients"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"github.com/gin-gonic/gin"
	"github.com/improbable-eng/go-httpwares/logging/logrus/ctxlogrus"
)

func sendError(c *gin.Context, err error) {
	statusCode := http.StatusInternalServerError

	if errors.Is(err, repositories.ErrNotFound) || errors.Is(err, clients.ErrNotFound) {
		statusCode = http.StatusNotFound
		return
	}

	if errors.Is(err, repositories.ErrInvalidInput) || errors.Is(err, clients.ErrBadRequest) {
		statusCode = http.StatusBadRequest
		return
	}

	if errors.Is(err, clients.ErrUnauthorized) {
		statusCode = http.StatusUnauthorized
	}

	if statusCode == http.StatusInternalServerError {
		ctxlogrus.Extract(c.Request.Context()).Errorf("Internal error happened: %s", err.Error())
	}

	c.JSON(statusCode, gin.H{
		"error": err.Error(),
	})
}

func ErrorHandler(c *gin.Context, err error, code int) {
	c.JSON(code, gin.H{
		"error": err.Error(),
	})
}

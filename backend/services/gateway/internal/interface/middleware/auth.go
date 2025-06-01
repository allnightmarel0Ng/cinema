package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/clients"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"github.com/gin-gonic/gin"
)

func NewAuth(auth clients.Auth) gin.HandlerFunc {
	return func(c *gin.Context) {
		if isUnauthorizableRequest(c) {
			c.Next()
			return
		}

		header := c.Request.Header.Get("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid authorization header",
			})
			c.Abort()
			return
		}

		user, err := auth.Authorize(c.Request.Context(), header[7:])
		if err != nil {
			sendError(c, err)
			c.Abort()
			return
		}

		ctx := UserToContext(c.Request.Context(), user)
		c.Request = c.Request.WithContext(ctx)
	}
}

type userKey struct{}

func UserToContext(ctx context.Context, user entities.User) context.Context {
	return context.WithValue(ctx, userKey{}, &user)
}

func UserFromContext(ctx context.Context) (entities.User, error) {
	user, ok := ctx.Value(userKey{}).(*entities.User)
	if !ok || user == nil {
		return entities.User{}, errors.New("user not found in context")
	}

	return *user, nil
}

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

	c.JSON(statusCode, gin.H{
		"error": err.Error(),
	})
}

func isUnauthorizableRequest(c *gin.Context) bool {
	path := c.Request.URL.Path
	return strings.HasPrefix(path, "/api/actors") ||
		strings.HasPrefix(path, "/api/movies") ||
		strings.HasPrefix(path, "/api/login") ||
		strings.HasPrefix(path, "/api/register") ||
		strings.HasPrefix(path, "/api/logout") ||
		strings.HasPrefix(path, "/api/users") ||
		(strings.HasPrefix(path, "/api/reviews") && c.Request.Method == "GET")
}

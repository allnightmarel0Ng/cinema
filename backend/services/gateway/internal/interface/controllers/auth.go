package controllers

import (
	"io"
	"net/http"
	"strings"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/clients"
	"github.com/gin-gonic/gin"
)

type Auth struct {
	auth clients.Auth
}

func NewAuth(auth clients.Auth) Auth {
	return Auth{
		auth: auth,
	}
}

func (a Auth) PostLogin(c *gin.Context) {
	id, token, err := a.auth.Login(c.Request.Context(), c.Request.Header.Get("Authorization"))
	if err != nil {
		sendError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":    id,
		"token": token,
	})
}

func (a Auth) PostRegister(c *gin.Context) {
	raw, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "unable to get body",
		})
		return
	}

	if err = a.auth.Register(c.Request.Context(), raw); err != nil {
		sendError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

func (a Auth) PostLogout(c *gin.Context) {
	header := c.Request.Header.Get("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid authorization header",
		})
		return
	}

	if err := a.auth.Logout(c.Request.Context(), header[8:]); err != nil {
		sendError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

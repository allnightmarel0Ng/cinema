package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/clients"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/entities"
	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/infrastructure/tracing"
)

type httpClient struct {
	timeout time.Duration

	host string
}

func NewHTTPClient(host string, timeout time.Duration) clients.Auth {
	return &httpClient{
		host:    host,
		timeout: timeout,
	}
}

func (hc *httpClient) Register(ctx context.Context, body []byte) error {
	ctx, cancel := context.WithTimeout(ctx, hc.timeout)
	defer cancel()

	endpoint := "http://" + hc.host + "/register"
	req, err := http.NewRequestWithContext(ctx, "POST", endpoint, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("%w: %s", clients.ErrUnexpected, err.Error())
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := tracing.DefaultHTTPClient().Do(req)
	if err != nil {
		return fmt.Errorf("%w: %s", clients.ErrUnexpected, err.Error())
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		return nil
	case http.StatusBadRequest:
		return clients.ErrBadRequest
	default:
		return clients.ErrUnexpected
	}
}

func (hc *httpClient) Login(ctx context.Context, base64Creds string) (int, string, error) {
	ctx, cancel := context.WithTimeout(ctx, hc.timeout)
	defer cancel()

	endpoint := "http://" + hc.host + "/login"
	req, err := http.NewRequestWithContext(ctx, "POST", endpoint, nil)
	if err != nil {
		return 0, "", fmt.Errorf("%w: %s", clients.ErrUnexpected, err.Error())
	}
	req.Header.Set("Authorization", base64Creds)

	resp, err := tracing.DefaultHTTPClient().Do(req)
	if err != nil {
		return 0, "", fmt.Errorf("%w: %s", clients.ErrUnexpected, err.Error())
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, "", fmt.Errorf("%w: %s", clients.ErrUnexpected, err.Error())
	}

	switch resp.StatusCode {
	case http.StatusOK:
		var tokenResponse struct {
			AccessToken string `json:"access_token"`
			UserID      int    `json:"user_id"`
		}
		if err := json.Unmarshal(body, &tokenResponse); err != nil {
			return 0, "", fmt.Errorf("%w: %s", clients.ErrUnexpected, err.Error())
		}
		return tokenResponse.UserID, tokenResponse.AccessToken, nil
	case http.StatusBadRequest:
		return 0, "", clients.ErrBadRequest
	case http.StatusUnauthorized:
		return 0, "", clients.ErrUnauthorized
	default:
		return 0, "", clients.ErrUnexpected
	}
}

func (hc *httpClient) Logout(ctx context.Context, token string) error {
	ctx, cancel := context.WithTimeout(ctx, hc.timeout)
	defer cancel()

	endpoint := "http://" + hc.host + "/logout?token=" + url.QueryEscape(token)
	req, err := http.NewRequestWithContext(ctx, "POST", endpoint, nil)
	if err != nil {
		return fmt.Errorf("%w: %s", clients.ErrUnexpected, err.Error())
	}

	resp, err := tracing.DefaultHTTPClient().Do(req)
	if err != nil {
		return fmt.Errorf("%w: %s", clients.ErrUnexpected, err.Error())
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		return nil
	case http.StatusBadRequest:
		return clients.ErrBadRequest
	default:
		return clients.ErrUnexpected
	}
}

func (hc *httpClient) Authorize(ctx context.Context, token string) (entities.User, error) {
	ctx, cancel := context.WithTimeout(ctx, hc.timeout)
	defer cancel()

	endpoint := "http://" + hc.host + "/authorize?token=" + url.QueryEscape(token)
	req, err := http.NewRequestWithContext(ctx, "GET", endpoint, nil)
	if err != nil {
		return entities.User{}, fmt.Errorf("%w: %s", clients.ErrUnexpected, err.Error())
	}

	resp, err := tracing.DefaultHTTPClient().Do(req)
	if err != nil {
		return entities.User{}, fmt.Errorf("%w: %s", clients.ErrUnexpected, err.Error())
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return entities.User{}, fmt.Errorf("%w: %s", clients.ErrUnexpected, err.Error())
	}

	switch resp.StatusCode {
	case http.StatusOK:
		var authResponse struct {
			UserID   int    `json:"user_id"`
			Username string `json:"username"`
		}
		if err := json.Unmarshal(body, &authResponse); err != nil {
			return entities.User{}, fmt.Errorf("%w: %s", clients.ErrUnexpected, err.Error())
		}

		return entities.User{
			ID:       authResponse.UserID,
			Username: authResponse.Username,
		}, nil

	case http.StatusUnauthorized:
		return entities.User{}, clients.ErrUnauthorized
	default:
		return entities.User{}, clients.ErrUnexpected
	}
}

func (hc *httpClient) Username(ctx context.Context, userID int) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, hc.timeout)
	defer cancel()

	endpoint := fmt.Sprintf("http://%s/get-username/%d", hc.host, userID)
	req, err := http.NewRequestWithContext(ctx, "GET", endpoint, nil)
	if err != nil {
		return "", err
	}

	resp, err := tracing.DefaultHTTPClient().Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	switch resp.StatusCode {
	case http.StatusOK:
		var usernameResponse struct {
			Username string `json:"username"`
		}
		if err := json.Unmarshal(body, &usernameResponse); err != nil {
			return "", fmt.Errorf("%w: %s", clients.ErrUnexpected, err.Error())
		}

		if usernameResponse.Username == "" {
			return "", clients.ErrNotFound
		}
		return usernameResponse.Username, nil

	default:
		return "", clients.ErrUnexpected
	}
}

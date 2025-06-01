package tracing

import (
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"net/http"
)

func DefaultHTTPClient() *http.Client {
	return otelhttp.DefaultClient
}

package metrics

import (
	"context"
	"errors"
	"time"

	"github.com/allnighmatel0Ng/cinema/backend/services/gateway/internal/domain/repositories"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/metric"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.20.0"
)

var (
	responseTimeHistogram metric.Float64Histogram
	responseCounter       metric.Int64Counter
	moviesCounter         metric.Int64Histogram
	dbResultCounter       metric.Int64Counter
)

func MustInit(ctx context.Context, collectorAddr string) func() {
	exporter, err := otlpmetricgrpc.New(ctx,
		otlpmetricgrpc.WithEndpoint(collectorAddr),
		otlpmetricgrpc.WithInsecure(),
	)
	if err != nil {
		panic(err)
	}

	res := resource.NewWithAttributes(
		semconv.SchemaURL,
		semconv.ServiceName("gateway"),
	)

	mp := sdkmetric.NewMeterProvider(
		sdkmetric.WithResource(res),
		sdkmetric.WithReader(sdkmetric.NewPeriodicReader(exporter)),
	)

	otel.SetMeterProvider(mp)

	meter := otel.Meter("gateway.metrics")

	responseTimeHistogram, err = meter.Float64Histogram("http_response_time_ms",
		metric.WithDescription("Response time by path"),
		metric.WithUnit("ms"),
		metric.WithExplicitBucketBoundaries(
			5, 10, 25, 50, 100,
			250, 500, 1000,
			2500, 5000, 10000,
		),
	)
	if err != nil {
		panic(err)
	}

	moviesCounter, err = meter.Int64Histogram("etl_movies_batch_size",
		metric.WithDescription("Batch size we got from ETL service"),
		metric.WithUnit("{count}"),
		metric.WithExplicitBucketBoundaries(30, 40, 50, 60, 70, 80, 90, 100),
	)
	if err != nil {
		panic(err)
	}

	responseCounter, err = meter.Int64Counter("http_auth_responses_codes",
		metric.WithDescription("Total HTTP responses by status class"),
		metric.WithUnit("{response}"),
	)
	if err != nil {
		panic(err)
	}

	dbResultCounter, err = meter.Int64Counter("app_operation_results",
		metric.WithDescription("Results of operations: success or error types"),
		metric.WithUnit("{count}"),
	)
	if err != nil {
		panic(err)
	}

	return func() {
		mp.Shutdown(ctx)
	}
}

func RecordResponseTime(ctx context.Context, duration time.Duration, path string) {
	responseTimeHistogram.Record(ctx, float64(duration.Milliseconds()), metric.WithAttributes(attribute.String("path", path)))
}

func RecordStatusCodeFromAuth(ctx context.Context, code int, path string) {
	responseCounter.Add(ctx, 1,
		metric.WithAttributes(
			attribute.String("status_class", getStatusClass(code)),
			attribute.String("path", path),
			attribute.Int("status_code", code),
		),
	)
}

func RecordBatchSize(ctx context.Context, size int) {
	moviesCounter.Record(ctx, int64(size))
}

func RecordDBResult(ctx context.Context, err error) {
	status := "ok"
	if err != nil {
		switch {
		case errors.Is(err, repositories.ErrNotFound):
			status = "not_found"
		case errors.Is(err, repositories.ErrUnexpected):
			status = "unexpected"
		case errors.Is(err, repositories.ErrInvalidInput):
			status = "invalid_input"
		default:
			status = "other_error"
		}
	}

	dbResultCounter.Add(ctx, 1,
		metric.WithAttributes(attribute.String("result", status)),
	)
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

package metrics

import (
	"context"
	"time"

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
	moviesCounter         metric.Int64Counter
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

	moviesCounter, err = meter.Int64Counter("etl_movies_batch_size",
		metric.WithDescription("Batch size we got from ETL service"),
		metric.WithUnit("{count}"),
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

	return func() {
		mp.Shutdown(ctx)
	}
}

func RecordResponseTime(ctx context.Context, duration time.Duration, path string) {
	responseTimeHistogram.Record(ctx, float64(duration), metric.WithAttributes(attribute.String("path", path)))
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
	moviesCounter.Add(ctx, 1,
		metric.WithAttributes(attribute.Int("batch_size", size)),
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

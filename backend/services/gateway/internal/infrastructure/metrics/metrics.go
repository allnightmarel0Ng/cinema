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
	// ── Existing ─────────────────────────────────────────────────────────────
	responseTimeHistogram metric.Float64Histogram
	responseCounter       metric.Int64Counter
	moviesCounter         metric.Int64Histogram
	dbResultCounter       metric.Int64Counter

	// ── HTTP total (all endpoints, with method) ───────────────────────────────
	httpRequestsTotal metric.Int64Counter

	// ── Business action counters ──────────────────────────────────────────────
	movieViewsTotal     metric.Int64Counter
	searchesTotal       metric.Int64Counter
	reviewsCreatedTotal metric.Int64Counter
	reviewsDeletedTotal metric.Int64Counter
	ratingsCreatedTotal metric.Int64Counter
	ratingsDeletedTotal metric.Int64Counter

	// ── User activity (hashed bucket to avoid cardinality explosion) ──────────
	userActionsTotal metric.Int64Counter
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

	// ── Existing ──────────────────────────────────────────────────────────────

	responseTimeHistogram, err = meter.Float64Histogram("http_response_time_ms",
		metric.WithDescription("Response time by path"),
		metric.WithUnit("ms"),
		metric.WithExplicitBucketBoundaries(5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000),
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

	// ── New: HTTP total ───────────────────────────────────────────────────────

	httpRequestsTotal, err = meter.Int64Counter("http_requests_total",
		metric.WithDescription("Total HTTP requests (all endpoints)"),
		metric.WithUnit("{request}"),
	)
	if err != nil {
		panic(err)
	}

	// ── New: business counters ────────────────────────────────────────────────

	movieViewsTotal, err = meter.Int64Counter("movie_views_total",
		metric.WithDescription("Number of movie detail views (GET /movies/{id})"),
		metric.WithUnit("{view}"),
	)
	if err != nil {
		panic(err)
	}

	searchesTotal, err = meter.Int64Counter("searches_total",
		metric.WithDescription("Number of search requests, labelled by type: movie | actor"),
		metric.WithUnit("{search}"),
	)
	if err != nil {
		panic(err)
	}

	reviewsCreatedTotal, err = meter.Int64Counter("reviews_created_total",
		metric.WithDescription("Number of reviews created or updated"),
		metric.WithUnit("{review}"),
	)
	if err != nil {
		panic(err)
	}

	reviewsDeletedTotal, err = meter.Int64Counter("reviews_deleted_total",
		metric.WithDescription("Number of reviews deleted"),
		metric.WithUnit("{review}"),
	)
	if err != nil {
		panic(err)
	}

	ratingsCreatedTotal, err = meter.Int64Counter("ratings_created_total",
		metric.WithDescription("Number of ratings created"),
		metric.WithUnit("{rating}"),
	)
	if err != nil {
		panic(err)
	}

	ratingsDeletedTotal, err = meter.Int64Counter("ratings_deleted_total",
		metric.WithDescription("Number of ratings deleted"),
		metric.WithUnit("{rating}"),
	)
	if err != nil {
		panic(err)
	}

	// ── New: user activity ────────────────────────────────────────────────────

	userActionsTotal, err = meter.Int64Counter("user_actions_total",
		metric.WithDescription("User actions bucketed by hashed user_id (1000 buckets) to avoid cardinality explosion"),
		metric.WithUnit("{action}"),
	)
	if err != nil {
		panic(err)
	}

	return func() {
		mp.Shutdown(ctx)
	}
}

// ── Existing functions ────────────────────────────────────────────────────────

func RecordResponseTime(ctx context.Context, duration time.Duration, path string) {
	responseTimeHistogram.Record(ctx, float64(duration.Milliseconds()),
		metric.WithAttributes(attribute.String("path", path)))
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

// ── New functions ─────────────────────────────────────────────────────────────

// RecordHTTPRequest записывает каждый входящий HTTP-запрос.
// Вызывается из middleware после c.Next().
func RecordHTTPRequest(ctx context.Context, method, path string, statusCode int) {
	httpRequestsTotal.Add(ctx, 1,
		metric.WithAttributes(
			attribute.String("method", method),
			attribute.String("path", path),
			attribute.Int("status_code", statusCode),
		),
	)
}

// RecordMovieView записывает просмотр карточки фильма (GET /movies/{id}).
func RecordMovieView(ctx context.Context) {
	movieViewsTotal.Add(ctx, 1)
}

// RecordSearch записывает поисковый запрос. searchType: "movie" | "actor".
func RecordSearch(ctx context.Context, searchType string) {
	searchesTotal.Add(ctx, 1,
		metric.WithAttributes(attribute.String("type", searchType)))
}

// RecordReviewCreated записывает создание или обновление отзыва.
func RecordReviewCreated(ctx context.Context) {
	reviewsCreatedTotal.Add(ctx, 1)
}

// RecordReviewDeleted записывает удаление отзыва.
func RecordReviewDeleted(ctx context.Context) {
	reviewsDeletedTotal.Add(ctx, 1)
}

// RecordRatingCreated записывает выставление оценки.
func RecordRatingCreated(ctx context.Context) {
	ratingsCreatedTotal.Add(ctx, 1)
}

// RecordRatingDeleted записывает удаление оценки.
func RecordRatingDeleted(ctx context.Context) {
	ratingsDeletedTotal.Add(ctx, 1)
}

// RecordUserAction записывает действие аутентифицированного пользователя.
// userID хешируется в 1000 бакетов чтобы избежать взрыва кардинальности.
// action: "view_movie" | "search" | "rate" | "review".
func RecordUserAction(ctx context.Context, userID int, action string) {
	userActionsTotal.Add(ctx, 1,
		metric.WithAttributes(
			attribute.Int("user_bucket", userID%1000),
			attribute.String("action", action),
		),
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

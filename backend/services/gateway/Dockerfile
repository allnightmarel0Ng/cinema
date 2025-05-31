FROM golang:1.24.3-alpine AS builder
WORKDIR /app


COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main ./cmd/etl/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /app


COPY --from=builder /app/main /app/main
COPY --from=builder /app/.env .env

EXPOSE 8080
ENTRYPOINT [ "/app/main" ]
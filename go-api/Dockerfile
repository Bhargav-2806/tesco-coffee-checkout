# ---------- Stage 1: build the Go binary ----------
# golang:1.22-alpine is the official Go image on Alpine Linux (~300MB) — only used at build time
FROM golang:1.22-alpine AS builder

# Working directory inside the build container
WORKDIR /app

# Copy everything first — we let "go mod tidy" reconcile go.mod / go.sum from the actual source
COPY . .

# "tidy" adds any missing imports to go.mod and regenerates go.sum — slower but robust
RUN go mod tidy

# CGO_ENABLED=0 produces a fully static binary that runs on tiny images (alpine / distroless)
# -ldflags "-s -w" strips debug info to shrink the binary (~5-8MB final)
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /app/go-api .

# ---------- Stage 2: tiny runtime image ----------
# alpine:3.20 is ~7MB — we just need a shell + CA certs for TLS (if needed later)
FROM alpine:3.20

# ca-certificates lets Go make outbound HTTPS calls; wget is used by docker-compose healthcheck
RUN apk add --no-cache ca-certificates wget

# Run as a non-root user for extra safety
RUN adduser -D -u 10001 app
USER app

WORKDIR /home/app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/go-api .

# Document the port the API listens on
EXPOSE 8080

# Start the API
CMD ["./go-api"]

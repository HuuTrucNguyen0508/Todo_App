# Cursor Todo App

A full-stack Todo application with comprehensive observability stack including Prometheus, Grafana, Loki, and Jaeger.

## Architecture

- **Frontend**: Next.js 14+ with App Router, React, TailwindCSS, shadcn-ui
- **Backend**: Node.js with Fastify, Prisma ORM, PostgreSQL
- **Observability**: Prometheus, Grafana, Loki, Promtail, Jaeger
- **Containerization**: Docker Compose with multi-stage builds

## Features

- ✅ Create, toggle, and delete todos
- ✅ Filter todos (all, active, completed)
- ✅ Optimistic UI updates
- ✅ Real-time metrics and logging
- ✅ Distributed tracing
- ✅ Pre-configured Grafana dashboards

## Quick Start

1. **Clone and setup**:

   ```bash
   git clone <repo>
   cd cursor-todo
   ```

2. **Set environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   ```

3. **Bootstrap and run**:

   ```bash
   pnpm bootstrap
   docker compose up -d --build
   ```

4. **Wait for services to be ready** (check with `docker compose ps`)

5. **Access the application**:
   - **Web App**: http://localhost:3003
   - **API**: http://localhost:4003
   - **Grafana**: http://localhost:3103 (admin/admin)
   - **Prometheus**: http://localhost:9093
   - **Jaeger**: http://localhost:16683
   - **Loki**: http://localhost:3113

## Development

```bash
# Install dependencies
pnpm bootstrap

# Run in development mode
pnpm dev

# Build all apps
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format
```

## Testing

Run the smoke test to verify everything works:

```bash
node scripts/smoke.mjs
```

## Services

### Web (Port 3003)

- Next.js frontend with shadcn-ui components
- Server-side metrics at `/api/metrics`
- Client-side event tracking

### API (Port 4003)

- Fastify REST API
- Prometheus metrics at `/metrics`
- OpenTelemetry tracing
- Structured JSON logging

### Observability Stack

- **Prometheus** (9093): Metrics collection
- **Grafana** (3103): Dashboards and visualization
- **Loki** (3113): Log aggregation
- **Jaeger** (16683): Distributed tracing

## Environment Variables

| Variable                      | Description                  | Default                 |
| ----------------------------- | ---------------------------- | ----------------------- |
| `DATABASE_URL`                | PostgreSQL connection string | Required                |
| `API_BASE_URL`                | Internal API URL for SSR     | `http://api:4003`       |
| `NEXT_PUBLIC_API_BASE_URL`    | Client-side API URL          | `http://localhost:4003` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Jaeger OTLP endpoint         | `http://jaeger:4318`    |

## Makefile Commands

```bash
make bootstrap    # Install dependencies
make up          # Start all services
make down        # Stop all services
make logs        # View logs
make migrate     # Run database migrations
```

## Monitoring

The Grafana dashboard includes:

- API request rates and latency
- Database query performance
- Error rates and traces
- Container logs via Loki
- Custom business metrics

Access Grafana at http://localhost:3103 with credentials `admin/admin`.

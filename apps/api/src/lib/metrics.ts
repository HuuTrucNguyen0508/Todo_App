import {
  register,
  Counter,
  Histogram,
  collectDefaultMetrics,
} from 'prom-client';

// Collect default metrics
collectDefaultMetrics();

// HTTP metrics
export const httpRequestsTotal = new Counter({
  name: 'api_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDuration = new Histogram({
  name: 'api_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 5],
});

// Database metrics
export const dbQueriesTotal = new Counter({
  name: 'api_db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table'],
});

export const dbQueryDuration = new Histogram({
  name: 'api_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

// Business metrics
export const todosCreatedTotal = new Counter({
  name: 'api_todos_created_total',
  help: 'Total number of todos created',
});

export const todosCompletedTotal = new Counter({
  name: 'api_todos_completed_total',
  help: 'Total number of todos completed',
});

export const todosDeletedTotal = new Counter({
  name: 'api_todos_deleted_total',
  help: 'Total number of todos deleted',
});

export function initMetrics() {
  // Register all metrics
  register.registerMetric(httpRequestsTotal);
  register.registerMetric(httpRequestDuration);
  register.registerMetric(dbQueriesTotal);
  register.registerMetric(dbQueryDuration);
  register.registerMetric(todosCreatedTotal);
  register.registerMetric(todosCompletedTotal);
  register.registerMetric(todosDeletedTotal);
}

export { register };

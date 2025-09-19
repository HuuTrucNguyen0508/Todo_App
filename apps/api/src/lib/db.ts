import { PrismaClient } from '@prisma/client';
import { dbQueriesTotal, dbQueryDuration } from './metrics';
import { logger } from './logger';
import { trace, SpanKind, SpanStatusCode } from '@opentelemetry/api';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});

// Log database events
prisma.$on('query', (e) => {
  logger.debug(
    {
      query: e.query,
      params: e.params,
      duration: e.duration,
    },
    'Database query executed'
  );
});

prisma.$on('error', (e) => {
  logger.error(e, 'Database error');
});

// Enhanced middleware with tracing and metrics
prisma.$use(async (params, next) => {
  const tracer = trace.getTracer('cursor-todo-api-db', '1.0.0');
  const start = Date.now();
  const operation = params.action;
  const table = params.model || 'unknown';

  // Create a span for the database operation
  const span = tracer.startSpan(`db.${operation}`, {
    kind: SpanKind.CLIENT,
    attributes: {
      'db.system': 'postgresql',
      'db.operation': operation,
      'db.name': 'neondb',
      'db.collection.name': table,
      component: 'prisma',
    },
  });

  try {
    const result = await next(params);
    const duration = (Date.now() - start) / 1000;

    // Update metrics
    dbQueriesTotal.inc({ operation, table });
    dbQueryDuration.observe({ operation, table }, duration);

    // Update span with success
    span.setAttributes({
      'db.duration_ms': Date.now() - start,
      'db.rows_affected': Array.isArray(result)
        ? result.length
        : result
          ? 1
          : 0,
    });
    span.setStatus({ code: SpanStatusCode.OK });

    return result;
  } catch (error) {
    const duration = (Date.now() - start) / 1000;

    // Update metrics even on error
    dbQueriesTotal.inc({ operation, table });
    dbQueryDuration.observe({ operation, table }, duration);

    // Update span with error
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Database error',
    });
    span.setAttributes({
      'db.duration_ms': Date.now() - start,
      error: true,
      'error.message': error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  } finally {
    span.end();
  }
});

export { prisma as db };

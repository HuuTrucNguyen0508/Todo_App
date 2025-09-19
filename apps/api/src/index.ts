import './lib/tracing'; // Must be first import
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { logger } from './lib/logger';
import { initMetrics } from './lib/metrics';
import { errorHandler } from './middleware/error';
import { todosRoutes } from './routes/todos';
import { metricsRoutes } from './routes/metrics';
import { db } from './lib/db';

const fastify = Fastify({
  logger: true,
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
});

async function start() {
  try {
    // Initialize metrics
    initMetrics();

    // Register CORS
    await fastify.register(cors, {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Register error handler
    fastify.setErrorHandler(errorHandler);

    // Health check
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Register routes
    await fastify.register(todosRoutes);
    await fastify.register(metricsRoutes);

    // Test database connection
    await db.$connect();
    logger.info('Database connected successfully');

    // Start server
    const port = parseInt(process.env.PORT || '4003');
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    logger.info(`API server listening on http://${host}:${port}`);
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully`);

  try {
    await fastify.close();
    await db.$disconnect();
    logger.info('Server shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error(error, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

start();

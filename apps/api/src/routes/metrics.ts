import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { register } from '../lib/metrics';

export async function metricsRoutes(fastify: FastifyInstance) {
  // GET /metrics - Prometheus metrics endpoint
  fastify.get(
    '/metrics',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const metrics = await register.metrics();

        return reply.type(register.contentType).send(metrics);
      } catch (error) {
        fastify.log.error(error, 'Failed to generate metrics');
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to generate metrics',
        });
      }
    }
  );
}

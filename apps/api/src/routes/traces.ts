import type { FastifyInstance } from 'fastify';
import { repositories } from '@agent-company-os/storage';

export async function tracesRoutes(app: FastifyInstance) {
  app.get('/traces', async () => repositories.traces.getAll());
}

import type { FastifyInstance } from 'fastify';
import { repositories } from '@agent-company-os/storage';
import { nowIso } from '@agent-company-os/agents';

export async function approvalRoutes(app: FastifyInstance) {
  app.get('/approvals', async () => (await repositories.actions.getAll()).filter((a) => a.status === 'pending'));
  app.post('/approvals/:actionId/approve', async (request, reply) => {
    const { actionId } = request.params as { actionId: string };
    const updated = await repositories.actions.update(actionId, (a) => ({ ...a, status: 'approved', updatedAt: nowIso() }));
    if (!updated) return reply.code(404).send({ message: 'Action not found' });
    return updated;
  });
  app.post('/approvals/:actionId/reject', async (request, reply) => {
    const { actionId } = request.params as { actionId: string };
    const updated = await repositories.actions.update(actionId, (a) => ({ ...a, status: 'rejected', updatedAt: nowIso() }));
    if (!updated) return reply.code(404).send({ message: 'Action not found' });
    return updated;
  });
}

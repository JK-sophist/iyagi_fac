import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { repositories } from '@agent-company-os/storage';
import { makeId, nowIso } from '@agent-company-os/agents';

const createGoalSchema = z.object({ title: z.string().min(1), description: z.string().min(1), targetMetric: z.string().min(1) });

export async function goalsRoutes(app: FastifyInstance) {
  app.post('/goals', async (request, reply) => {
    const parsed = createGoalSchema.parse(request.body);
    const now = nowIso();
    const goal = { id: makeId('goal'), ...parsed, status: 'queued' as const, createdAt: now, updatedAt: now };
    await repositories.goals.add(goal);
    return reply.code(201).send(goal);
  });

  app.get('/goals', async () => repositories.goals.getAll());

  app.get('/goals/:goalId', async (request, reply) => {
    const { goalId } = request.params as { goalId: string };
    const goal = await repositories.goals.findById(goalId);
    if (!goal) return reply.code(404).send({ message: 'Goal not found' });
    const [missions, evidence, proposals, evalResults, actions, traces, revenueEvents] = await Promise.all([
      repositories.missions.getAll(), repositories.evidence.getAll(), repositories.proposals.getAll(), repositories.evalResults.getAll(), repositories.actions.getAll(), repositories.traces.getAll(), repositories.revenueEvents.getAll()
    ]);
    return {
      goal,
      missions: missions.filter((m) => m.goalId === goalId),
      evidence: evidence.filter((e) => e.goalId === goalId),
      proposals: proposals.filter((p) => p.goalId === goalId),
      evalResults: evalResults.filter((e) => e.goalId === goalId),
      actions: actions.filter((a) => a.goalId === goalId),
      traces: traces.filter((t) => t.goalId === goalId),
      revenueEvents: revenueEvents.filter((r) => r.goalId === goalId)
    };
  });
}

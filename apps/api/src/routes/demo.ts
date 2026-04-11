import type { FastifyInstance } from 'fastify';
import { createProviderFromEnv } from '@agent-company-os/providers';
import { makeId, nowIso } from '@agent-company-os/agents';
import { repositories } from '@agent-company-os/storage';
import { CompanyOrchestrator } from '@agent-company-os/orchestrator';

export async function demoRoutes(app: FastifyInstance) {
  app.post('/demo/run-sample', async () => {
    const now = nowIso();
    const goal = {
      id: makeId('goal'),
      title: 'Increase demo requests from founder-led outbound',
      description: 'Current outreach has low reply rates and unclear value proposition.',
      targetMetric: '20 qualified demo requests/month',
      status: 'queued' as const,
      createdAt: now,
      updatedAt: now
    };
    await repositories.goals.add(goal);
    const provider = createProviderFromEnv(process.env);
    const orchestrator = new CompanyOrchestrator(provider);
    await orchestrator.runGoal(goal);
    return { ok: true, goalId: goal.id, provider: provider.mode };
  });
}

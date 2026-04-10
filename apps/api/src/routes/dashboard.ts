import type { FastifyInstance } from 'fastify';
import { repositories } from '@agent-company-os/storage';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/dashboard', async () => {
    const [goals, actions, proposals, revenueEvents, traces] = await Promise.all([
      repositories.goals.getAll(), repositories.actions.getAll(), repositories.proposals.getAll(), repositories.revenueEvents.getAll(), repositories.traces.getAll()
    ]);
    return {
      goalCount: goals.length,
      pendingApprovalCount: actions.filter((a) => a.status === 'pending').length,
      proposalCount: proposals.length,
      revenueEventCount: revenueEvents.length,
      recentGoals: goals.slice(-5).reverse(),
      pendingApprovals: actions.filter((a) => a.status === 'pending').slice(-5).reverse(),
      recentTraces: traces.slice(-10).reverse()
    };
  });
}

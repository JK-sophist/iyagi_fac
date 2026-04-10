import { describe, expect, it } from 'vitest';
import { BuilderAgent, COOAgent } from '@agent-company-os/agents';
import { MockAgentProvider } from '@agent-company-os/providers';

describe('Agents', () => {
  it('COO creates at least 3 missions', () => {
    const coo = new COOAgent();
    const missions = coo.decomposeGoal({ id: 'g1', title: 't', description: 'd', targetMetric: 'm', status: 'queued', createdAt: 'x', updatedAt: 'x' });
    expect(missions.length).toBeGreaterThanOrEqual(3);
  });

  it('Builder fills core proposal fields', async () => {
    const builder = new BuilderAgent(new MockAgentProvider());
    const proposal = await builder.run({ id: 'g1', title: 't', description: 'd', targetMetric: 'm', status: 'queued', createdAt: 'x', updatedAt: 'x' }, [
      { id: 'e1', goalId: 'g1', missionId: 'm1', sourceType: 'mock', title: 'ev', summary: 's', supportingPoints: ['a'], confidence: 0.8, createdAt: 'x' }
    ]);
    expect(proposal.problem.length).toBeGreaterThan(0);
    expect(proposal.offer.length).toBeGreaterThan(0);
    expect(proposal.landingCopy.length).toBeGreaterThan(0);
    expect(proposal.outreachDraft.length).toBeGreaterThan(0);
  });
});

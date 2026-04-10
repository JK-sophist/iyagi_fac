import { describe, expect, it } from 'vitest';
import { MockAgentProvider } from '@agent-company-os/providers';

describe('MockAgentProvider', () => {
  it('is deterministic for evidence/proposal', async () => {
    const provider = new MockAgentProvider();
    const mission: any = { id: 'm1', goalId: 'g1', title: 't', objective: 'o', input: { a: 1 } };
    const e1 = await provider.generateEvidence(mission);
    const e2 = await provider.generateEvidence(mission);
    expect(e1).toEqual(e2);

    const goal: any = { id: 'g1', title: 'goal', description: 'desc', targetMetric: 'metric' };
    const p1 = await provider.generateProposal(goal, [{ ...e1, id: 'e1', createdAt: 'x' } as any]);
    const p2 = await provider.generateProposal(goal, [{ ...e1, id: 'e1', createdAt: 'x' } as any]);
    expect(p1).toEqual(p2);
  });
});

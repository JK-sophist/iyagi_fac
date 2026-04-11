import type { AgentProvider } from '@agent-company-os/providers';
import type { Evidence, Goal, Proposal } from '@agent-company-os/shared-types';
import { makeId, nowIso } from './types';

export class BuilderAgent {
  constructor(private readonly provider: AgentProvider) {}

  async run(goal: Goal, evidenceBundle: Evidence[]): Promise<Proposal> {
    const data = await this.provider.generateProposal(goal, evidenceBundle);
    const now = nowIso();
    return { ...data, id: makeId('proposal'), status: 'draft', createdAt: now, updatedAt: now };
  }
}

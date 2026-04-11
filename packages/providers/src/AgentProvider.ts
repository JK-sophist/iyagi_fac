import type { Evidence, Goal, Mission, Proposal } from '@agent-company-os/shared-types';

export interface AgentProvider {
  readonly mode: 'mock' | 'anthropic';
  generateEvidence(mission: Mission): Promise<Omit<Evidence, 'id' | 'createdAt'>>;
  generateProposal(goal: Goal, evidenceBundle: Evidence[]): Promise<Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'status'>>;
}

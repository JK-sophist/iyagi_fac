import type { AgentProvider } from './AgentProvider';
import type { Evidence, Goal, Mission, Proposal } from '@agent-company-os/shared-types';

export class MockAgentProvider implements AgentProvider {
  readonly mode = 'mock' as const;

  async generateEvidence(mission: Mission): Promise<Omit<Evidence, 'id' | 'createdAt'>> {
    return {
      goalId: mission.goalId,
      missionId: mission.id,
      sourceType: 'mock',
      title: `[Mock Evidence] ${mission.title}`,
      summary: `Deterministic research summary for mission: ${mission.objective}`,
      supportingPoints: [
        'ICP demands clear ROI proof.',
        'Low-friction offer outperforms feature-heavy copy.',
        `Mission input hash key: ${JSON.stringify(mission.input).length}`
      ],
      confidence: 0.78
    };
  }

  async generateProposal(goal: Goal, evidenceBundle: Evidence[]): Promise<Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'status'>> {
    const evidenceLine = evidenceBundle.map((e) => e.title).join(', ');
    return {
      goalId: goal.id,
      title: `[Mock Proposal] ${goal.title}`,
      problem: `${goal.description} blocks ${goal.targetMetric}.`,
      offer: '2-week pilot: AI-assisted outbound + landing page refinement.',
      targetCustomer: 'B2B founders with <$50k MRR and limited GTM team',
      pricingHypothesis: '$1,500 setup + $750/week managed iteration',
      landingCopy: `Headline: Reach ${goal.targetMetric} faster\nEvidence: ${evidenceLine}`,
      outreachDraft: `Subject: quick idea for ${goal.title}\nBody: We found repeatable demand cues and prepared a pilot offer.`
    };
  }
}

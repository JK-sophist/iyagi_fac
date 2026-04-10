import type { EvalResult, Proposal } from '@agent-company-os/shared-types';

const required: Array<keyof Proposal> = ['problem', 'offer', 'targetCustomer', 'pricingHypothesis', 'landingCopy', 'outreachDraft'];
const riskyTerms = ['guaranteed', 'risk-free profit', 'instant millions'];

export class EvalHarness {
  evaluate(goalId: string, proposal: Proposal): Omit<EvalResult, 'id' | 'createdAt'> {
    const missingItems: string[] = [];
    for (const key of required) {
      if (!proposal[key] || String(proposal[key]).trim().length === 0) missingItems.push(String(key));
    }
    const riskFlags = riskyTerms.filter((term) => `${proposal.landingCopy} ${proposal.outreachDraft}`.toLowerCase().includes(term));
    const findings = [
      missingItems.length ? `Missing required fields: ${missingItems.join(', ')}` : 'All required fields are present.',
      riskFlags.length ? `Risky claims detected: ${riskFlags.join(', ')}` : 'No critical risky claims found.'
    ];
    const score = Math.max(0, 100 - missingItems.length * 20 - riskFlags.length * 15);
    return { goalId, proposalId: proposal.id, score, passed: score >= 70, findings, missingItems, riskFlags };
  }
}

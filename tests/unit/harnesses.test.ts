import { describe, expect, it } from 'vitest';
import { EvalHarness } from '@agent-company-os/harness-eval';
import { RiskHarness } from '@agent-company-os/harness-risk';

describe('Harnesses', () => {
  it('Eval harness catches missing fields', () => {
    const evalHarness = new EvalHarness();
    const result = evalHarness.evaluate('g1', {
      id: 'p1', goalId: 'g1', title: 't', problem: '', offer: '', targetCustomer: '', pricingHypothesis: '', landingCopy: '', outreachDraft: '', status: 'draft', createdAt: 'x', updatedAt: 'x'
    });
    expect(result.missingItems.length).toBeGreaterThan(0);
    expect(result.passed).toBe(false);
  });

  it('Risk harness queues external action', () => {
    const risk = new RiskHarness();
    const action = risk.applyPolicy({
      id: 'a1', goalId: 'g1', proposalId: 'p1', actionType: 'send_outreach_email', payload: {}, requiresApproval: false, riskLevel: 'medium', status: 'executed', createdAt: 'x', updatedAt: 'x'
    });
    expect(action.status).toBe('pending');
    expect(action.requiresApproval).toBe(true);
  });
});

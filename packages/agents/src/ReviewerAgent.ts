import type { EvalResult, Proposal } from '@agent-company-os/shared-types';
import { EvalHarness } from '@agent-company-os/harness-eval';
import { makeId, nowIso } from './types';

export class ReviewerAgent {
  constructor(private readonly evalHarness: EvalHarness) {}

  run(goalId: string, proposal: Proposal): EvalResult {
    const base = this.evalHarness.evaluate(goalId, proposal);
    return { ...base, id: makeId('eval'), createdAt: nowIso() };
  }
}

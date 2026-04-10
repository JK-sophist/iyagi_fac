import type { Goal } from '@agent-company-os/shared-types';

export function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(): string { return new Date().toISOString(); }

export function seedMissions(goal: Goal) {
  const at = nowIso();
  return [
    {
      id: makeId('mission'), goalId: goal.id, ownerAgent: 'scout' as const, title: 'Market + ICP Research',
      objective: `Find demand signals tied to ${goal.targetMetric}`,
      input: { goalTitle: goal.title }, doneDefinition: ['3+ demand signals', 'competitor angle'], status: 'queued' as const, createdAt: at, updatedAt: at
    },
    {
      id: makeId('mission'), goalId: goal.id, ownerAgent: 'builder' as const, title: 'Draft Offer + Messaging',
      objective: 'Build offer hypothesis with landing/outreach draft',
      input: { expectedEvidence: true }, doneDefinition: ['Offer statement', 'Landing draft', 'Outreach draft'], status: 'queued' as const, createdAt: at, updatedAt: at
    },
    {
      id: makeId('mission'), goalId: goal.id, ownerAgent: 'reviewer' as const, title: 'Evaluate + Approval Packaging',
      objective: 'Run eval and produce approval action',
      input: { evalRules: 'v1' }, doneDefinition: ['Eval score', 'risk flags', 'action request'], status: 'queued' as const, createdAt: at, updatedAt: at
    }
  ];
}

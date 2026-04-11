import { z } from 'zod';

export const GoalStatus = z.enum(['queued', 'running', 'blocked_approval', 'completed', 'failed']);
export const MissionOwner = z.enum(['coo', 'scout', 'builder', 'reviewer']);
export const MissionStatus = z.enum(['queued', 'running', 'completed', 'failed']);
export const SourceType = z.enum(['mock', 'anthropic', 'web', 'file', 'internal']);
export const ProposalStatus = z.enum(['draft', 'reviewed', 'approved', 'rejected']);
export const ActionType = z.enum(['send_outreach_email', 'publish_landing', 'schedule_post']);
export const RiskLevel = z.enum(['low', 'medium', 'high']);
export const ActionStatus = z.enum(['pending', 'approved', 'rejected', 'executed']);
export const ProviderType = z.enum(['mock', 'anthropic', 'internal']);

export const GoalSchema = z.object({
  id: z.string(), title: z.string(), description: z.string(), targetMetric: z.string(),
  status: GoalStatus, createdAt: z.string(), updatedAt: z.string()
});
export type Goal = z.infer<typeof GoalSchema>;

export const MissionSchema = z.object({
  id: z.string(), goalId: z.string(), ownerAgent: MissionOwner, title: z.string(), objective: z.string(),
  input: z.any(), doneDefinition: z.array(z.string()), status: MissionStatus, createdAt: z.string(), updatedAt: z.string()
});
export type Mission = z.infer<typeof MissionSchema>;

export const EvidenceSchema = z.object({
  id: z.string(), goalId: z.string(), missionId: z.string(), sourceType: SourceType, title: z.string(),
  summary: z.string(), supportingPoints: z.array(z.string()), confidence: z.number(), createdAt: z.string()
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const ProposalSchema = z.object({
  id: z.string(), goalId: z.string(), title: z.string(), problem: z.string(), offer: z.string(), targetCustomer: z.string(),
  pricingHypothesis: z.string(), landingCopy: z.string(), outreachDraft: z.string(), status: ProposalStatus, createdAt: z.string(), updatedAt: z.string()
});
export type Proposal = z.infer<typeof ProposalSchema>;

export const EvalResultSchema = z.object({
  id: z.string(), goalId: z.string(), proposalId: z.string(), score: z.number(), passed: z.boolean(),
  findings: z.array(z.string()), missingItems: z.array(z.string()), riskFlags: z.array(z.string()), createdAt: z.string()
});
export type EvalResult = z.infer<typeof EvalResultSchema>;

export const ActionRequestSchema = z.object({
  id: z.string(), goalId: z.string(), proposalId: z.string(), actionType: ActionType, payload: z.any(),
  requiresApproval: z.boolean(), riskLevel: RiskLevel, status: ActionStatus, createdAt: z.string(), updatedAt: z.string()
});
export type ActionRequest = z.infer<typeof ActionRequestSchema>;

export const TraceRecordSchema = z.object({
  id: z.string(), goalId: z.string(), agent: z.string(), step: z.string(), inputSummary: z.string(), outputSummary: z.string(),
  provider: ProviderType, toolCalls: z.array(z.string()), status: z.string(), createdAt: z.string()
});
export type TraceRecord = z.infer<typeof TraceRecordSchema>;

export const RevenueEventSchema = z.object({
  id: z.string(), goalId: z.string(), eventType: z.enum(['proposal_ready', 'approval_requested', 'lead_created', 'demo_requested']),
  value: z.number(), metadata: z.any(), createdAt: z.string()
});
export type RevenueEvent = z.infer<typeof RevenueEventSchema>;

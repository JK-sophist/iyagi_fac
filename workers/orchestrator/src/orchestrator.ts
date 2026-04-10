import { BuilderAgent, COOAgent, ReviewerAgent, ScoutAgent, makeId, nowIso } from '@agent-company-os/agents';
import { EvalHarness } from '@agent-company-os/harness-eval';
import { RiskHarness } from '@agent-company-os/harness-risk';
import { RevenueHarness } from '@agent-company-os/harness-revenue';
import type { AgentProvider } from '@agent-company-os/providers';
import { repositories } from '@agent-company-os/storage';
import type { ActionRequest, Goal, TraceRecord } from '@agent-company-os/shared-types';

function trace(goalId: string, agent: string, step: string, inputSummary: string, outputSummary: string, provider: TraceRecord['provider'], status = 'completed'): TraceRecord {
  return { id: makeId('trace'), goalId, agent, step, inputSummary, outputSummary, provider, toolCalls: [], status, createdAt: nowIso() };
}

export class CompanyOrchestrator {
  private readonly coo = new COOAgent();
  private readonly scout: ScoutAgent;
  private readonly builder: BuilderAgent;
  private readonly reviewer = new ReviewerAgent(new EvalHarness());
  private readonly risk = new RiskHarness();
  private readonly revenue = new RevenueHarness();

  constructor(private readonly provider: AgentProvider) {
    this.scout = new ScoutAgent(provider);
    this.builder = new BuilderAgent(provider);
  }

  async runGoal(goal: Goal) {
    try {
      await repositories.goals.update(goal.id, (g) => ({ ...g, status: 'running', updatedAt: nowIso() }));

      const missions = this.coo.decomposeGoal(goal);
      await repositories.missions.saveAll([...(await repositories.missions.getAll()), ...missions]);
      await repositories.traces.add(trace(goal.id, 'coo', 'decompose_goal', goal.title, `${missions.length} missions`, 'internal'));

      const scoutMission = missions.find((m) => m.ownerAgent === 'scout');
      const evidences = scoutMission ? await this.scout.run(scoutMission) : [];
      await repositories.evidence.saveAll([...(await repositories.evidence.getAll()), ...evidences]);
      await repositories.traces.add(trace(goal.id, 'scout', 'generate_evidence', scoutMission?.title ?? 'none', `${evidences.length} evidence`, this.provider.mode));

      const proposal = await this.builder.run(goal, evidences);
      await repositories.proposals.add(proposal);
      await repositories.traces.add(trace(goal.id, 'builder', 'generate_proposal', `${evidences.length} evidence`, proposal.title, this.provider.mode));

      const evalResult = this.reviewer.run(goal.id, proposal);
      await repositories.evalResults.add(evalResult);
      await repositories.traces.add(trace(goal.id, 'reviewer', 'evaluate_proposal', proposal.id, `score=${evalResult.score}`, 'internal'));

      await repositories.revenueEvents.add({ id: makeId('rev'), ...this.revenue.createEvent(goal.id, 'proposal_ready', 1, { proposalId: proposal.id }), createdAt: nowIso() });

      if (evalResult.passed) {
        const now = nowIso();
        const action: ActionRequest = {
          id: makeId('action'), goalId: goal.id, proposalId: proposal.id, actionType: 'send_outreach_email', payload: { draft: proposal.outreachDraft },
          requiresApproval: true, riskLevel: 'medium', status: 'pending', createdAt: now, updatedAt: now
        };
        const queued = this.risk.applyPolicy(action);
        await repositories.actions.add(queued);
        await repositories.revenueEvents.add({ id: makeId('rev'), ...this.revenue.createEvent(goal.id, 'approval_requested', 1, { actionId: queued.id }), createdAt: nowIso() });
        await repositories.goals.update(goal.id, (g) => ({ ...g, status: 'blocked_approval', updatedAt: nowIso() }));
      } else {
        await repositories.goals.update(goal.id, (g) => ({ ...g, status: 'failed', updatedAt: nowIso() }));
      }
    } catch (error) {
      await repositories.traces.add(trace(goal.id, 'orchestrator', 'run_goal', goal.id, String(error), 'internal', 'failed'));
      await repositories.goals.update(goal.id, (g) => ({ ...g, status: 'failed', updatedAt: nowIso() }));
      throw error;
    }
  }
}

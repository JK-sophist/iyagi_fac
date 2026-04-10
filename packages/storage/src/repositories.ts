import path from 'node:path';
import type { ActionRequest, EvalResult, Evidence, Goal, Mission, Proposal, RevenueEvent, TraceRecord } from '@agent-company-os/shared-types';
import { JsonStore } from './jsonStore';

const dataRoot = path.resolve(process.cwd(), 'runtime-data');

export const repositories = {
  goals: new JsonStore<Goal>(path.join(dataRoot, 'goals.json')),
  missions: new JsonStore<Mission>(path.join(dataRoot, 'missions.json')),
  evidence: new JsonStore<Evidence>(path.join(dataRoot, 'evidence.json')),
  proposals: new JsonStore<Proposal>(path.join(dataRoot, 'proposals.json')),
  evalResults: new JsonStore<EvalResult>(path.join(dataRoot, 'eval-results.json')),
  actions: new JsonStore<ActionRequest>(path.join(dataRoot, 'actions.json')),
  traces: new JsonStore<TraceRecord>(path.join(dataRoot, 'traces.json')),
  revenueEvents: new JsonStore<RevenueEvent>(path.join(dataRoot, 'revenue-events.json'))
};

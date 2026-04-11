import type { AgentProvider } from '@agent-company-os/providers';
import type { Evidence, Mission } from '@agent-company-os/shared-types';
import { makeId, nowIso } from './types';

export class ScoutAgent {
  constructor(private readonly provider: AgentProvider) {}

  async run(mission: Mission): Promise<Evidence[]> {
    const generated = await this.provider.generateEvidence(mission);
    return [{ ...generated, id: makeId('evidence'), createdAt: nowIso() }];
  }
}

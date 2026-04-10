import type { Goal, Mission } from '@agent-company-os/shared-types';
import { seedMissions } from './types';

export class COOAgent {
  decomposeGoal(goal: Goal): Mission[] {
    return seedMissions(goal);
  }
}

import type { RevenueEvent } from '@agent-company-os/shared-types';

export class RevenueHarness {
  createEvent(goalId: string, eventType: RevenueEvent['eventType'], value = 1, metadata: unknown = {}): Omit<RevenueEvent, 'id' | 'createdAt'> {
    return { goalId, eventType, value, metadata };
  }
}

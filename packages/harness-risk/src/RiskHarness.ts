import type { ActionRequest } from '@agent-company-os/shared-types';

export class RiskHarness {
  applyPolicy(action: ActionRequest): ActionRequest {
    return {
      ...action,
      requiresApproval: true,
      status: 'pending',
      updatedAt: new Date().toISOString()
    };
  }
}

import type { TraceRecord } from '@agent-company-os/shared-types';
import type { ToolRegistry } from './ToolRegistry';

export class RuntimeHarness {
  constructor(private readonly registry: ToolRegistry) {}

  async executeTool(name: string, input: unknown, opts?: { timeoutMs?: number; retries?: number }): Promise<{ result: unknown; trace: Omit<TraceRecord, 'id' | 'createdAt'> }> {
    if (!this.registry.has(name)) throw new Error(`Tool not allowed: ${name}`);
    const tool = this.registry.get(name)!;
    const retries = opts?.retries ?? 1;
    let lastErr: unknown;
    for (let i = 0; i <= retries; i += 1) {
      try {
        const result = await Promise.race([
          tool(input),
          new Promise((_, rej) => setTimeout(() => rej(new Error('Tool timeout')), opts?.timeoutMs ?? 5000))
        ]);
        return { result, trace: { goalId: 'runtime', agent: 'runtime-harness', step: name, inputSummary: JSON.stringify(input), outputSummary: JSON.stringify(result).slice(0, 300), provider: 'internal', toolCalls: [name], status: 'completed' } };
      } catch (err) { lastErr = err; }
    }
    throw lastErr;
  }
}

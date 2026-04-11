import { AnthropicManagedAgentsProvider } from './AnthropicManagedAgentsProvider';
import { MockAgentProvider } from './MockAgentProvider';

export * from './AgentProvider';
export * from './MockAgentProvider';
export * from './AnthropicManagedAgentsProvider';

export function createProviderFromEnv(env: NodeJS.ProcessEnv) {
  if (env.PROVIDER_MODE === 'anthropic') {
    return new AnthropicManagedAgentsProvider({
      apiKey: env.ANTHROPIC_API_KEY,
      model: env.ANTHROPIC_MODEL ?? 'claude-3-7-sonnet-latest',
      betaHeader: env.ANTHROPIC_BETA_HEADER ?? 'managed-agents-2025-01-01',
      agentId: env.ANTHROPIC_AGENT_ID,
      environmentId: env.ANTHROPIC_ENVIRONMENT_ID
    });
  }
  return new MockAgentProvider();
}

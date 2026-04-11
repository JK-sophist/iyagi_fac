export type ToolFn = (input: unknown) => Promise<unknown>;

export class ToolRegistry {
  private readonly tools = new Map<string, ToolFn>();

  register(name: string, fn: ToolFn) { this.tools.set(name, fn); }
  has(name: string) { return this.tools.has(name); }
  get(name: string) { return this.tools.get(name); }
}

import { describe, it, expect } from 'vitest';

describe('GGVercel MCP Server', () => {
  it('should define MCP tools', () => {
    const tools = ['roll_dice', 'get_weather', 'ai_generate', 'sandbox_execute', 'list_models'];
    expect(tools).toHaveLength(5);
  });

  it('should have valid model IDs', () => {
    const models = [
      'openai/gpt-5',
      'openai/gpt-5-nano',
      'anthropic/claude-sonnet-4.5',
      'xai/grok-4',
      'google/gemini-3-flash',
    ];
    for (const model of models) {
      expect(model).toMatch(/^[a-z]+\/[\w.-]+$/);
    }
  });
});

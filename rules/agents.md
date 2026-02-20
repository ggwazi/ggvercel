# Agent Rules

## Agent Factory Pattern

### Structure
```typescript
export async function create[Name]Agent(config: AgentConfig = {}) {
  const { model = 'openai/gpt-5-nano', systemPrompt } = config;
  
  return {
    async execute(task: string) {
      // Implementation
    },
  };
}
```

## Tool Definition

### Use `tool()` Function
```typescript
import { tool } from 'ai';

tools: {
  toolName: tool({
    description: 'What it does',
    inputSchema: z.object({
      param: z.string().describe('Description'),
    }),
    execute: async ({ param }) => {
      return { result: 'value' };
    },
  }),
}
```

## Model Selection

| Task Type | Recommended Model |
|-----------|-------------------|
| Simple tasks | `openai/gpt-5-nano` |
| Complex reasoning | `anthropic/claude-sonnet-4.5` |
| Fast responses | `xai/grok-4.1-fast-non-reasoning` |
| Code generation | `openai/gpt-5` |

## System Prompts

### Structure
```typescript
const SYSTEM_PROMPT = `
You are a [role].

Rules:
- Rule 1
- Rule 2

Output format:
- Expected format
`;
```

### Keep Prompts Concise
- Focus on essential instructions
- Use bullet points
- Include examples for complex tasks

## Error Handling

### Graceful Degradation
```typescript
try {
  const { text } = await generateText({ ... });
  return { text };
} catch (error) {
  // Fallback to simpler model or return error
  return { error: error.message };
}
```

## Step Limits

### Prevent Infinite Loops
```typescript
// Use maxSteps to limit tool calls
const { text, steps } = await generateText({
  model: gateway(model),
  prompt: task,
  maxSteps: 5,  // Limit iterations
  tools: { ... },
});
```

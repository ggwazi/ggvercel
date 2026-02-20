---
name: create-agent
description: Create a new AI agent with tools and workflow
---

You are creating a new AI agent for the GGVercel system. Follow this pattern:

## 1. Define Agent Configuration

```typescript
export interface AgentConfig {
  model?: string;        // Default: 'openai/gpt-5-nano'
  systemPrompt?: string; // System instructions
  maxSteps?: number;     // Max tool calls
}
```

## 2. Create the Agent Factory

```typescript
export async function create[Name]Agent(config: AgentConfig = {}) {
  const { model = 'openai/gpt-5-nano', systemPrompt } = config;
  
  return {
    async execute(task: string) {
      const { text, steps } = await generateText({
        model: gateway(model),
        prompt: task,
        system: systemPrompt,
        tools: {
          // Define tools here
        },
      });
      return { text, steps };
    },
  };
}
```

## 3. Define Tools

Use the `tool()` function from 'ai' package:

```typescript
tools: {
  toolName: tool({
    description: 'What this tool does',
    inputSchema: z.object({
      param: z.string().describe('Parameter description'),
    }),
    execute: async ({ param }) => {
      // Tool implementation
      return { result: 'value' };
    },
  }),
}
```

## 4. Register in `src/agents/index.ts`

Export the agent factory and add to the module.

## 5. Add Dashboard Endpoint

Create an endpoint in `src/routes/dashboard.ts` to invoke the agent.

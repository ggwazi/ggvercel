import { generateText, streamText, tool, Agent } from 'ai';
import { gateway } from 'ai';
import { z } from 'zod';
import { Sandbox } from '@vercel/sandbox';

export interface AgentConfig {
  model?: string;
  systemPrompt?: string;
  maxSteps?: number;
}

export async function createCodeAgent(config: AgentConfig = {}) {
  const { model = 'openai/gpt-5-nano', systemPrompt, maxSteps = 5 } = config;
  
  return {
    async execute(task: string) {
      const { text, steps } = await generateText({
        model: gateway(model),
        prompt: task,
        system: systemPrompt || 'You are a helpful coding assistant.',
        tools: {
          executeCode: tool({
            description: 'Execute JavaScript code in a sandbox',
            inputSchema: z.object({
              code: z.string().describe('JavaScript code to execute'),
            }),
            execute: async ({ code }) => {
              try {
                const sandbox = await Sandbox.create({ runtime: 'node22', timeout: 10000 });
                await sandbox.writeFiles([{ path: 'code.mjs', content: Buffer.from(code) }]);
                const result = await sandbox.runCommand('node', ['code.mjs']);
                const stdout = await result.stdout();
                const stderr = await result.stderr();
                await sandbox.stop();
                return { output: stdout || stderr, success: !stderr };
              } catch (error) {
                return { error: error instanceof Error ? error.message : 'Unknown error', success: false };
              }
            },
          }),
          searchDocs: tool({
            description: 'Search documentation for information',
            inputSchema: z.object({
              query: z.string().describe('Search query'),
            }),
            execute: async ({ query }) => {
              return { results: `Documentation search for: ${query} (simulated)` };
            },
          }),
        },
      });
      
      return { text, steps };
    },
  };
}

export async function createResearchAgent(config: AgentConfig = {}) {
  const { model = 'openai/gpt-5-nano', maxSteps = 3 } = config;
  
  return {
    async research(topic: string) {
      const { text, steps } = await generateText({
        model: gateway(model),
        prompt: `Research and summarize: ${topic}`,
        tools: {
          webSearch: tool({
            description: 'Search the web for information',
            inputSchema: z.object({
              query: z.string(),
            }),
            execute: async ({ query }) => ({
              results: `Simulated web search for: ${query}`,
            }),
          }),
        },
      });
      
      return { summary: text, steps };
    },
  };
}

export async function createWorkflowAgent(config: AgentConfig = {}) {
  const { model = 'openai/gpt-5-nano' } = config;
  
  return {
    async runWorkflow(tasks: string[]) {
      const results = [];
      
      for (const task of tasks) {
        const { text } = await generateText({
          model: gateway(model),
          prompt: task,
        });
        results.push({ task, result: text });
      }
      
      return results;
    },
  };
}

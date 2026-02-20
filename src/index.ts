import 'dotenv/config';
import express from 'express';
import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { Sandbox } from '@vercel/sandbox';
import { generateText, streamText } from 'ai';
import { gateway } from 'ai';

const app = express();
app.use(express.json());

const mcpHandler = createMcpHandler(
  (server) => {
    server.tool(
      'roll_dice',
      'Roll a dice with a specified number of sides',
      { sides: z.number().int().min(2).max(100).describe('Number of sides on the dice') },
      async ({ sides }) => {
        const value = 1 + Math.floor(Math.random() * sides);
        return {
          content: [{ type: 'text', text: `🎲 You rolled a ${value}!` }],
        };
      }
    );

    server.tool(
      'get_weather',
      'Get simulated weather for a location',
      { location: z.string().describe('City or location name') },
      async ({ location }) => {
        const conditions = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy'];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        const temp = Math.floor(Math.random() * 40) - 5;
        return {
          content: [{ type: 'text', text: `Weather in ${location}: ${condition}, ${temp}°C` }],
        };
      }
    );

    server.tool(
      'ai_generate',
      'Generate text using AI Gateway with specified model',
      { 
        prompt: z.string().describe('The prompt to send to the AI'),
        model: z.string().optional().default('openai/gpt-5-nano').describe('Model ID (e.g., openai/gpt-5-nano, anthropic/claude-sonnet-4.5)')
      },
      async ({ prompt, model }) => {
        try {
          const { text } = await generateText({
            model: gateway(model),
            prompt,
          });
          return {
            content: [{ type: 'text', text }],
          };
        } catch (error) {
          return {
            content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      'sandbox_execute',
      'Execute JavaScript code safely in a Vercel Sandbox',
      { 
        code: z.string().describe('JavaScript code to execute'),
        timeout: z.number().optional().default(30000).describe('Timeout in milliseconds')
      },
      async ({ code, timeout }) => {
        try {
          const sandbox = await Sandbox.create({ 
            runtime: 'node22',
            timeout 
          });
          
          await sandbox.writeFiles([{
            path: 'code.mjs',
            content: Buffer.from(code)
          }]);
          
          const result = await sandbox.runCommand('node', ['code.mjs']);
          
          const stdout = await result.stdout();
          const stderr = await result.stderr();
          
          await sandbox.stop();
          
          return {
            content: [{ 
              type: 'text', 
              text: stdout || stderr || 'No output' 
            }],
          };
        } catch (error) {
          return {
            content: [{ type: 'text', text: `Sandbox error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      'list_models',
      'List available AI models through the gateway',
      {},
      async () => {
        const models = [
          { id: 'openai/gpt-5', name: 'GPT-5', provider: 'OpenAI' },
          { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', provider: 'OpenAI' },
          { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic' },
          { id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic' },
          { id: 'xai/grok-4', name: 'Grok 4', provider: 'xAI' },
          { id: 'google/gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google' },
        ];
        
        return {
          content: [{ 
            type: 'text', 
            text: `Available models:\n${models.map(m => `- ${m.id} (${m.name} by ${m.provider})`).join('\n')}` 
          }],
        };
      }
    );
  },
  {},
  { basePath: '/api' }
);

app.all('/api/mcp', mcpHandler);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    name: 'GGVercel MCP Server',
    version: '1.0.0',
    endpoints: {
      mcp: '/api/mcp',
      health: '/health',
      dashboard: '/dashboard',
    },
    tools: [
      'roll_dice',
      'get_weather',
      'ai_generate',
      'sandbox_execute',
      'list_models',
    ],
  });
});

import { createDashboardRouter } from './routes/dashboard.js';
app.use('/dashboard', createDashboardRouter());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 MCP Server running at http://localhost:${port}`);
  console.log(`📡 MCP endpoint: http://localhost:${port}/api/mcp`);
  console.log(`📊 Dashboard: http://localhost:${port}/dashboard`);
});

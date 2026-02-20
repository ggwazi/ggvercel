import { Router, type Request, type Response, type NextFunction } from 'express';
import { generateText, streamText, tool } from 'ai';
import { gateway } from 'ai';
import { z } from 'zod';
import { Sandbox } from '@vercel/sandbox';

export function createDashboardRouter(): Router {
  const router = Router();

  const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    const oidcToken = process.env.VERCEL_OIDC_TOKEN;
    
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }
    
    const token = authHeader.replace('Bearer ', '');
    if (token !== apiKey && token !== oidcToken) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }
    
    next();
  };

  router.get('/', (req, res) => {
    res.json({
      name: 'GGVercel AI Dashboard',
      endpoints: {
        'GET /': 'This help',
        'GET /status': 'System status',
        'POST /chat': 'Chat with AI',
        'POST /sandbox': 'Execute code in sandbox',
        'POST /agent': 'Run AI agent workflow',
        'GET /models': 'List available models',
      },
    });
  });

  router.get('/status', (req, res) => {
    res.json({
      status: 'operational',
      services: {
        aiGateway: 'connected',
        sandbox: 'available',
        mcpServer: 'running',
      },
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || 'development',
    });
  });

  router.post('/chat', authMiddleware, async (req, res) => {
    try {
      const { messages, model = 'openai/gpt-5-nano', stream = false } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: 'Messages array required' });
        return;
      }

      if (stream) {
        const result = streamText({
          model: gateway(model),
          messages,
        });
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        for await (const chunk of result.textStream) {
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
        
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        const { text, usage } = await generateText({
          model: gateway(model),
          messages,
        });
        
        res.json({ text, usage });
      }
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  router.post('/sandbox', authMiddleware, async (req, res) => {
    try {
      const { code, runtime = 'node22', timeout = 30000 } = req.body;
      
      if (!code) {
        res.status(400).json({ error: 'Code required' });
        return;
      }

      const sandbox = await Sandbox.create({ 
        runtime,
        timeout,
      });
      
      await sandbox.writeFiles([{
        path: 'code.mjs',
        content: Buffer.from(code)
      }]);
      
      const result = await sandbox.runCommand(
        runtime.startsWith('node') ? 'node' : 'python3', 
        ['code.mjs']
      );
      
      const stdout = await result.stdout();
      const stderr = await result.stderr();
      
      await sandbox.stop();
      
      res.json({
        stdout,
        stderr,
        exitCode: result.exitCode,
      });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  router.post('/agent', authMiddleware, async (req, res) => {
    try {
      const { task, model = 'openai/gpt-5-nano' } = req.body;
      
      if (!task) {
        res.status(400).json({ error: 'Task required' });
        return;
      }

      const { text, steps } = await generateText({
        model: gateway(model),
        prompt: task,
        tools: {
          calculate: tool({
            description: 'Perform calculations',
            inputSchema: z.object({ expression: z.string() }),
            execute: async ({ expression }) => {
              try {
                const result = Function(`"use strict"; return (${expression})`)();
                return { result };
              } catch {
                return { error: 'Invalid expression' };
              }
            },
          }),
          search: tool({
            description: 'Search for information',
            inputSchema: z.object({ query: z.string() }),
            execute: async ({ query }) => {
              return { results: `Simulated search: ${query}` };
            },
          }),
        },
      });
      
      res.json({ text, steps });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  router.get('/models', async (req, res) => {
    res.json({
      models: [
        { id: 'openai/gpt-5', name: 'GPT-5', provider: 'OpenAI', type: 'chat' },
        { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', provider: 'OpenAI', type: 'chat' },
        { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI', type: 'chat' },
        { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', type: 'chat' },
        { id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic', type: 'chat' },
        { id: 'xai/grok-4', name: 'Grok 4', provider: 'xAI', type: 'chat' },
        { id: 'xai/grok-4.1-fast-non-reasoning', name: 'Grok 4.1 Fast', provider: 'xAI', type: 'chat' },
        { id: 'google/gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google', type: 'chat' },
        { id: 'google/gemini-3-pro', name: 'Gemini 3 Pro', provider: 'Google', type: 'chat' },
      ],
    });
  });

  return router;
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run via Turborepo from the monorepo root:

```bash
pnpm install          # Install dependencies
pnpm dev              # Start all apps in dev mode (tsx watch)
pnpm build            # Build all packages (tsc)
pnpm test             # Run all tests (vitest run)
pnpm test:watch       # Watch mode tests
pnpm test:coverage    # Coverage report
pnpm lint             # Type-check all packages (tsc --noEmit)
pnpm docs             # Generate TypeDoc docs
vercel --prod         # Deploy to Vercel
```

To run commands scoped to a single package:
```bash
pnpm --filter @ggvercel/server test   # Test only server
pnpm --filter @ggvercel/shared build  # Build only shared
```

To test MCP tools interactively:
```bash
npx @modelcontextprotocol/inspector http://localhost:3000/api/mcp
```

## Architecture

This is a **Turborepo monorepo** with pnpm workspaces:

- `apps/server/` — The main app: Express v5 + MCP server (TypeScript, ESM, Node 22)
- `packages/shared/` — Shared types (`AgentConfig`, `McpToolResult`, `ModelInfo`), constants (`AVAILABLE_MODELS`, `DEFAULT_MODEL`), and `formatError` utility. Must be built before `server`.

### Server architecture (`apps/server/src/`)

- `index.ts` — Entry point. Registers all MCP tools via `createMcpHandler` (from `mcp-handler`), mounts the dashboard router, starts Express. MCP endpoint is at `POST /api/mcp`.
- `routes/dashboard.ts` — REST API with `authMiddleware` (Bearer token matching `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`). Exposes `/dashboard/chat`, `/dashboard/sandbox`, `/dashboard/agent` (auth required), and `/dashboard/status`, `/dashboard/models` (public).
- `agents/index.ts` — Agent factories (`createCodeAgent`, `createResearchAgent`, `createWorkflowAgent`) using Vercel AI SDK's `generateText` with tool calling. All agents accept `AgentConfig` and default to `openai/gpt-5-nano`.

### Key dependencies

| Package | Purpose |
|---|---|
| `mcp-handler` | Wraps `@modelcontextprotocol/sdk` for HTTP MCP servers |
| `ai` + `gateway()` | Vercel AI SDK — unified access to 100+ models |
| `@vercel/sandbox` | Isolated code execution (Node 22, Python) |
| `zod` | Runtime input validation for all MCP tools and routes |
| `express` v5 | HTTP server |

Models are addressed as `provider/model-id` strings (e.g., `openai/gpt-5-nano`, `anthropic/claude-sonnet-4.5`) passed to `gateway(model)`.

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `AI_GATEWAY_API_KEY` | Yes | Also used as the Bearer token for dashboard auth |
| `VERCEL_OIDC_TOKEN` | Auto | Set automatically on Vercel deployments |
| `PORT` | No | Default 3000 |

Vercel deployment uses `@ai-gateway-api-key` secret (see `vercel.json`).

## Code Conventions

- **TypeScript strict mode**, ESM (`"type": "module"`), target ES2022, `NodeNext` module resolution. Local imports must use `.js` extension even for `.ts` source files.
- Import order: `dotenv/config` first, then external packages, then local `.js` imports.
- Use `import type` for type-only imports.
- Naming: files `kebab-case`, functions `camelCase`, MCP tool names `snake_case`, agent factories `create[Name]Agent`.
- Commits: conventional commits (`feat`, `fix`, `docs`, etc.) with upper-first subject line.

### MCP tool pattern

All tools live inside `createMcpHandler`'s callback in `index.ts` and must follow:

```typescript
server.tool(
  'tool_name',          // snake_case
  'Description',        // imperative phrase
  { param: z.string().describe('...') },  // Zod schema
  async ({ param }) => {
    try {
      return { content: [{ type: 'text', text: result }] };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }
);
```

Always clean up sandbox resources after use (call `await sandbox.stop()`). Set `maxSteps` on `generateText` calls that use tools to prevent infinite loops.

### Agent factory pattern

```typescript
export async function create[Name]Agent(config: AgentConfig = {}) {
  const { model = 'openai/gpt-5-nano', systemPrompt, maxSteps = 5 } = config;
  return {
    async execute(task: string) {
      const { text, steps } = await generateText({
        model: gateway(model),
        prompt: task,
        system: systemPrompt,
        maxSteps,
        tools: { /* tool() definitions */ },
      });
      return { text, steps };
    },
  };
}
```

### Model selection guidance

| Task | Model |
|---|---|
| Simple/default | `openai/gpt-5-nano` |
| Complex reasoning | `anthropic/claude-sonnet-4.5` |
| Fast responses | `xai/grok-4.1-fast-non-reasoning` |
| Code generation | `openai/gpt-5` |

## Reference docs

- `rules/agents.md` — Agent patterns in detail
- `rules/mcp-tools.md` — MCP tool guidelines
- `rules/code-quality.md` — TypeScript, Express, and security rules
- `.github/instructions/` — Copilot instructions for common tasks (creating tools, agents, deploying)

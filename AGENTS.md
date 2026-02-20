# AGENTS.md — GGVercel MCP Server

## Build & Run
- Install: `pnpm install --ignore-workspace`
- Dev: `pnpm dev` (tsx watch), Start: `pnpm start`, Build: `tsc`
- Test: `pnpm test` (vitest), `pnpm test:watch`, `pnpm test:coverage`. MCP tools: `npx @modelcontextprotocol/inspector http://localhost:3000/api/mcp`
- Deploy: `vercel --prod`

## Architecture
- **Express + MCP server** (TypeScript, ESM, Node 22). Entry: `src/index.ts` — MCP handler at `/api/mcp`, dashboard at `/dashboard`.
- `src/routes/dashboard.ts` — REST API (chat, sandbox, agent, models) with Bearer token auth.
- `src/agents/index.ts` — AI agent factories using `generateText`/`streamText` from `ai` SDK + `gateway()` for model routing.
- Key deps: `ai` (Vercel AI SDK), `@vercel/sandbox`, `@modelcontextprotocol/sdk`, `mcp-handler`, `zod`, `express` v5.
- Env: `AI_GATEWAY_API_KEY` (required), `VERCEL_OIDC_TOKEN` (auto on Vercel), `PORT` (default 3000).

## Code Style & Conventions
- **TypeScript strict mode**, ESM (`"type": "module"`), target ES2022, `NodeNext` module resolution.
- Naming: files `kebab-case`, functions `camelCase`, MCP tool names `snake_case`, agents `create[Name]Agent`.
- MCP tools return `{ content: [{ type: 'text', text }] }`; errors add `isError: true`. Always validate inputs with Zod.
- Error pattern: `catch (error) { error instanceof Error ? error.message : 'Unknown error' }`.
- Imports: `dotenv/config` first, then external packages, then local `.js` extension imports.
- Commits: conventional commits (`feat`, `fix`, `docs`, etc.), subject upper-first case.
- See `rules/agents.md` for agent patterns and `.github/instructions/mcp-tools.md` for MCP tool guidelines.

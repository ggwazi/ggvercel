# GGVercel MCP Server Instructions

This is an AI-powered MCP (Model Context Protocol) Express server with Vercel integrations.

## Architecture

```
src/
├── index.ts           # Main Express server + MCP handler
├── routes/
│   └── dashboard.ts   # Dashboard API routes
├── agents/
│   └── index.ts       # AI agent factories
└── tools/             # MCP tool implementations
```

## Key Technologies

- **MCP Handler**: `mcp-handler` package for Model Context Protocol
- **AI Gateway**: Vercel AI Gateway for unified model access
- **Sandbox**: `@vercel/sandbox` for isolated code execution
- **AI SDK**: Vercel AI SDK for agents and tool calling

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_GATEWAY_API_KEY` | Yes | Vercel AI Gateway API key |
| `VERCEL_OIDC_TOKEN` | Auto | OIDC token on Vercel deployments |
| `PORT` | No | Server port (default: 3000) |

## MCP Tools

1. `roll_dice` - Roll a dice
2. `get_weather` - Simulated weather
3. `ai_generate` - Generate text with AI
4. `sandbox_execute` - Execute code in sandbox
5. `list_models` - List available models

## Dashboard Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /` | No | API info |
| `GET /status` | No | System status |
| `POST /chat` | Yes | Chat with AI |
| `POST /sandbox` | Yes | Execute code |
| `POST /agent` | Yes | Run agent workflow |
| `GET /models` | No | List models |

## Development

```bash
pnpm install --ignore-workspace
pnpm dev
```

## Deployment

```bash
vercel --prod
```

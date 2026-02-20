# GGVercel MCP Server

AI-powered MCP (Model Context Protocol) Express server with Vercel AI Gateway, Sandbox, and Agentkit integrations.

## Features

- **MCP Server**: Model Context Protocol server with multiple tools
- **AI Gateway**: Unified access to 100+ AI models
- **Sandbox**: Safe code execution in isolated environments
- **Agents**: Multi-step AI agents with tool calling
- **Dashboard**: Authenticated REST API for AI operations

## Quick Start

```bash
# Install dependencies
pnpm install --ignore-workspace

# Set environment variables
echo "AI_GATEWAY_API_KEY=your_key_here" > .env.local

# Run development server
pnpm dev
```

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/api/mcp` | POST | MCP protocol endpoint |
| `/health` | GET | Health check |
| `/dashboard` | GET | Dashboard info |
| `/dashboard/status` | GET | System status |
| `/dashboard/chat` | POST | Chat with AI (auth required) |
| `/dashboard/sandbox` | POST | Execute code (auth required) |
| `/dashboard/agent` | POST | Run agent workflow (auth required) |
| `/dashboard/models` | GET | List available models |

## MCP Tools

1. **roll_dice** - Roll a dice with specified sides
2. **get_weather** - Get simulated weather for a location
3. **ai_generate** - Generate text using AI Gateway
4. **sandbox_execute** - Execute code in Vercel Sandbox
5. **list_models** - List available AI models

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_GATEWAY_API_KEY` | Yes | Vercel AI Gateway API key |
| `VERCEL_OIDC_TOKEN` | Auto | OIDC token on Vercel |
| `PORT` | No | Server port (default: 3000) |

### MCP Client Configuration

Add to your MCP client config (e.g., `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "ggvercel": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

## Deployment

```bash
# Deploy to Vercel
vercel --prod
```

## Project Structure

```
ggvercel/
├── src/
│   ├── index.ts          # Main server + MCP handler
│   ├── routes/
│   │   └── dashboard.ts  # Dashboard API routes
│   ├── agents/
│   │   └── index.ts      # AI agent factories
│   └── tools/            # MCP tool implementations
├── .github/
│   ├── workflows/        # GitHub Actions
│   ├── prompts/          # Copilot prompts
│   └── instructions/     # Development instructions
├── schemas/              # JSON schemas
├── rules/                # Code quality rules
└── .agents/
    └── skills/           # Vercel agent skills
```

## GitHub Actions

- **CI/CD**: Automated testing and deployment
- **CodeQL**: Security analysis
- **Scorecard**: OpenSSF security scorecard
- **Coverage**: Code coverage reporting
- **Release**: Automated releases with changelogs
- **Auto-merge**: Automatic PR merging
- **Stale**: Stale issue/PR management
- **Labeler**: Automatic PR labeling
- **PR Check**: PR validation

## License

MIT

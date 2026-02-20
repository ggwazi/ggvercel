---
name: deploy-to-vercel
description: Deploy the MCP server to Vercel
---

## Deployment Steps

### 1. Prerequisites
- Vercel CLI installed: `pnpm add -g vercel`
- Vercel account linked: `vercel link`
- Environment variables set in Vercel dashboard

### 2. Required Environment Variables
```
AI_GATEWAY_API_KEY     # From Vercel AI Gateway
VERCEL_OIDC_TOKEN      # Auto-generated on Vercel
```

### 3. Deploy Commands

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### 4. Post-Deployment

1. **Update MCP client configs**:
```json
{
  "mcpServers": {
    "ggvercel": {
      "url": "https://your-app.vercel.app/api/mcp"
    }
  }
}
```

2. **Test endpoints**:
```bash
# Health check
curl https://your-app.vercel.app/health

# MCP tools list
curl -X POST https://your-app.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list"}'
```

### 5. Monitoring

- View logs: `vercel logs`
- Check deployments: `vercel list`
- Monitor in dashboard: https://vercel.com/dashboard

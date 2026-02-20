# MCP Tool Development

When creating MCP tools for this server:

## Tool Structure

All tools must:
1. Use Zod for input validation
2. Return `{ content: [{ type: 'text', text: string }] }`
3. Handle errors gracefully with `isError: true`

## File Locations

- Main tools: `src/index.ts` in the `createMcpHandler` callback
- Agent tools: `src/agents/index.ts`
- Dashboard endpoints: `src/routes/dashboard.ts`

## Naming Conventions

- Tool names: `snake_case` (e.g., `sandbox_execute`)
- Functions: `camelCase` (e.g., `createCodeAgent`)
- Files: `kebab-case` (e.g., `dashboard.ts`)

## Error Handling

```typescript
try {
  // Implementation
  return { content: [{ type: 'text', text: result }] };
} catch (error) {
  return {
    content: [{ type: 'text', text: `Error: ${error.message}` }],
    isError: true,
  };
}
```

## Testing

Test tools with MCP Inspector:
```bash
npx @modelcontextprotocol/inspector http://localhost:3000/api/mcp
```

# MCP Tool Rules

## Tool Definition

### Required Structure
```typescript
server.tool(
  'tool_name',           // snake_case
  'Tool description',    // Clear, concise
  { /* Zod schema */ },
  async (params) => {    // Handler
    try {
      // Implementation
      return { content: [{ type: 'text', text: result }] };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);
```

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Tool name | snake_case | `sandbox_execute` |
| Description | Imperative | "Execute code in sandbox" |
| Parameters | camelCase | `timeout` |
| Description text | Lowercase start | "timeout in milliseconds" |

## Parameter Rules

### Required Parameters
```typescript
{ 
  code: z.string().describe('Code to execute')
}
```

### Optional Parameters
```typescript
{
  timeout: z.number().optional().default(30000).describe('Timeout in ms')
}
```

### Enum Parameters
```typescript
{
  runtime: z.enum(['node22', 'node24', 'python3.13']).default('node22')
}
```

## Error Handling

### Always Catch Errors
```typescript
try {
  // Implementation
} catch (error) {
  return {
    content: [{
      type: 'text',
      text: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
    }],
    isError: true,
  };
}
```

### User-Friendly Messages
- Don't expose internal errors
- Provide actionable guidance
- Include relevant context

## Performance Rules

### Set Timeouts
```typescript
const sandbox = await Sandbox.create({ timeout: 30000 });
```

### Clean Up Resources
```typescript
try {
  // Work
} finally {
  await sandbox.stop();
}
```

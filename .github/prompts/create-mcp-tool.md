---
name: create-mcp-tool
description: Create a new MCP tool with proper schema and error handling
---

You are creating a new MCP tool for the GGVercel server. Follow these steps:

1. **Define the tool schema** using Zod:
   - Use descriptive names and descriptions for each field
   - Add default values where appropriate
   - Use `.optional()` for optional parameters

2. **Implement the tool handler**:
   - Wrap logic in try-catch
   - Return `{ content: [{ type: 'text', text: string }] }`
   - Set `isError: true` for error responses

3. **Example template**:
```typescript
server.tool(
  'tool_name',
  'Tool description',
  { 
    param: z.string().describe('Parameter description'),
    optional: z.number().optional().default(10)
  },
  async ({ param, optional }) => {
    try {
      // Implementation
      return {
        content: [{ type: 'text', text: 'Result' }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);
```

4. **Register the tool** in the MCP handler in `src/index.ts`
5. **Add dashboard endpoint** if needed in `src/routes/dashboard.ts`
6. **Update the tools list** in the root endpoint

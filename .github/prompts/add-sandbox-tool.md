---
name: add-sandbox-tool
description: Add a tool that executes code in Vercel Sandbox
---

You are adding a sandbox execution tool. Follow this pattern:

## Sandbox Tool Template

```typescript
sandbox_execute: tool({
  description: 'Execute code in an isolated sandbox environment',
  inputSchema: z.object({
    code: z.string().describe('Code to execute'),
    runtime: z.enum(['node22', 'node24', 'python3.13']).optional().default('node22'),
    timeout: z.number().optional().default(30000),
  }),
  execute: async ({ code, runtime, timeout }) => {
    try {
      // 1. Create sandbox
      const sandbox = await Sandbox.create({ 
        runtime,
        timeout,
      });
      
      // 2. Write files
      await sandbox.writeFiles([{
        path: 'code.mjs',  // or .py for Python
        content: Buffer.from(code)
      }]);
      
      // 3. Run command
      const result = await sandbox.runCommand(
        runtime.startsWith('node') ? 'node' : 'python3',
        ['code.mjs']
      );
      
      // 4. Get output
      const stdout = await result.stdout();
      const stderr = await result.stderr();
      
      // 5. Cleanup
      await sandbox.stop();
      
      return { 
        stdout, 
        stderr, 
        exitCode: result.exitCode 
      };
    } catch (error) {
      return { error: error.message };
    }
  },
}),
```

## Best Practices

1. **Always set a timeout** to prevent runaway processes
2. **Always stop the sandbox** after execution
3. **Handle both stdout and stderr**
4. **Use Buffer.from()** for file content
5. **Consider using snapshots** for repeated operations

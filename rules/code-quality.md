# Code Quality Rules

## TypeScript Rules

### Always Use Type Imports
```typescript
import type { Express } from 'express';  // Good
import { Express } from 'express';       // Bad for types only
```

### Prefer Async/Await
```typescript
async function fetchData() {
  try {
    const result = await fetch(url);
    return result.json();
  } catch (error) {
    console.error(error);
  }
}
```

### Use Zod for Runtime Validation
```typescript
const schema = z.object({
  name: z.string(),
  age: z.number().optional(),
});
type Input = z.infer<typeof schema>;
```

## Express Rules

### Always Handle Errors
```typescript
app.get('/api/endpoint', async (req, res) => {
  try {
    // Handler logic
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Validate Request Bodies
```typescript
const result = schema.safeParse(req.body);
if (!result.success) {
  res.status(400).json({ error: result.error });
  return;
}
```

## MCP Rules

### Return Proper Content Structure
```typescript
return {
  content: [{ type: 'text', text: 'Result' }],
  isError: false,
};
```

### Use Descriptive Tool Names
- Good: `sandbox_execute`, `ai_generate`, `list_models`
- Bad: `exec`, `gen`, `list`

## Security Rules

### Never Log Secrets
```typescript
console.log(`API Key: ${process.env.API_KEY}`);  // NEVER
```

### Validate All User Input
- Sanitize file paths
- Limit string lengths
- Restrict allowed values

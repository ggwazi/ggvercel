# Sandbox Rules

## Safety First

### Always Set Timeouts
```typescript
const sandbox = await Sandbox.create({ 
  timeout: 30000  // Maximum execution time
});
```

### Validate Code Before Execution
```typescript
// Check for dangerous patterns
if (code.includes('rm -rf') || code.includes('eval(')) {
  return { error: 'Potentially dangerous code detected' };
}
```

## Resource Management

### Always Clean Up
```typescript
const sandbox = await Sandbox.create();
try {
  // Execute code
  const result = await sandbox.runCommand(...);
  return result;
} finally {
  await sandbox.stop();  // Always stop
}
```

### Use Snapshots for Repeated Operations
```typescript
// Create snapshot after setup
const snapshot = await sandbox.snapshot();

// Reuse for subsequent runs
const sandbox2 = await Sandbox.create({ 
  source: { type: 'snapshot', snapshotId: snapshot.id }
});
```

## File Operations

### Write Files Properly
```typescript
await sandbox.writeFiles([{
  path: 'code.mjs',
  content: Buffer.from(code),  // Must be Buffer
}]);
```

### Read Results
```typescript
const result = await sandbox.runCommand('node', ['code.mjs']);
const stdout = await result.stdout();
const stderr = await result.stderr();
```

## Network Restrictions

### Limit Network Access
```typescript
const sandbox = await Sandbox.create({
  networkPolicy: {
    mode: 'custom',
    allowedDomains: ['api.example.com', 'cdn.example.com'],
  },
});
```

## Runtime Selection

| Runtime | Use Case |
|---------|----------|
| `node22` | JavaScript/TypeScript (stable) |
| `node24` | Latest Node.js features |
| `python3.13` | Python code execution |

## Timeout Guidelines

| Operation Type | Recommended Timeout |
|---------------|---------------------|
| Simple calculations | 5-10 seconds |
| API calls | 30 seconds |
| File processing | 60 seconds |
| Long computations | 5 minutes max |

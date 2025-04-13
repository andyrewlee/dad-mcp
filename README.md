# DadMCP

Spark your kid's creativity with AI-powered education at home. Remote MCP server for dad-powered learning.

## Connecting to Remote MCP Server

```
{
  "mcpServers": {
    "DadMCP": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://dadmcp.com/sse"
      ]
    }
  }
}
```

## Running Locally

Set up local Supabase
```
supabase start
npx supabase gen types typescript --local > lib/database.types.ts
```

Update .env.local
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=YourSupabaseAnonKey
REDIS_URL=redis://localhost:6379
```

Run Redis, install dependencies and run Next.js server
```
redis-server
pnpm i
pnpm run dev
```


# MCP-Miro Debugging Notes

## MCP Inspector Setup Issues (Port 3000 and Token Configuration)

### Problem Description
The MCP Inspector was failing to start properly due to two main issues:
1. Port 3000 being already in use
2. Incorrect token configuration (mixing up Miro OAuth token with Inspector configuration)

### Solution
The correct way to start the Inspector with proper token configuration:

```bash
# First, ensure no existing node processes are running
pkill -f "node"

# Then start the Inspector with the Miro token as an environment variable
MIRO_OAUTH_TOKEN=eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_oNg9E9Ws0du7c5-03fnS8D2YoSo npx @modelcontextprotocol/inspector build/index.js
```

### Common Issues

1. **Port 3000 Already in Use**
   - Error: `Error: listen EADDRINUSE: address already in use :::3000`
   - Solution: Kill existing node processes with `pkill -f "node"`

2. **Token Configuration**
   - The Miro token must be passed as an environment variable `MIRO_OAUTH_TOKEN`
   - Don't confuse the Miro OAuth token with the Inspector configuration token

### Working Configuration
- MCP Inspector runs on port 3000 (proxy server)
- Web interface available at http://localhost:5173
- Miro token must be set via `MIRO_OAUTH_TOKEN` environment variable

### Verification
When properly configured, you should see:
```
Starting MCP inspector...
Proxy server listening on port 3000
🔍 MCP Inspector is up and running at http://localhost:5173 🚀
``` 
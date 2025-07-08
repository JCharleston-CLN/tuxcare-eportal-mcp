# Migration Notice

## Package Moved

This package has been moved to a new npm organization and GitHub repository:

### New Locations:
- **NPM**: `@tuxcare-se/tuxcare-eportal-mcp`
- **GitHub**: https://github.com/JCharleston-CLN/tuxcare-eportal-mcp

### Migration Instructions:

#### 1. Uninstall Old Package
```bash
npm uninstall -g tuxcare-eportal-mcp
```

#### 2. Install New Package
```bash
npm install -g @tuxcare-se/tuxcare-eportal-mcp
```

#### 3. Update Your Configuration
Update your Claude Desktop MCP configuration to use the new package:

**Old:**
```json
{
  "mcpServers": {
    "tuxcare-eportal": {
      "command": "npx",
      "args": ["tuxcare-eportal-mcp@1.0.5", ...]
    }
  }
}
```

**New:**
```json
{
  "mcpServers": {
    "tuxcare-eportal": {
      "command": "npx",
      "args": ["@tuxcare-se/tuxcare-eportal-mcp@1.0.5", ...]
    }
  }
}
```

### Why the Move?
This package is now officially maintained by TuxCare SE under the `@tuxcare-se` npm organization for better organization and official support.

### Support
- **Issues**: https://github.com/JCharleston-CLN/tuxcare-eportal-mcp/issues
- **Documentation**: https://github.com/JCharleston-CLN/tuxcare-eportal-mcp#readme
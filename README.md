# TuxCare ePortal MCP Server

A Model Context Protocol (MCP) server for integrating with TuxCare ePortal API. This server provides MCP tools for managing servers, feeds, registration keys, patchsets, and users through the ePortal API.

## Features

- **Server Management**: List, register, and unregister servers with advanced filtering
- **Feed Management**: Create, modify, and delete feeds
- **Key Management**: Manage registration keys for server enrollment
- **Patchset Management**: List and manage patchset deployments
- **User Management**: List ePortal users
- **Server Tagging**: Set and manage server tags
- **Flexible Authentication**: Support for basic auth and API keys

## Installation

### Via npm (Recommended)

```bash
# Install globally
npm install -g tuxcare-eportal-mcp

# Or use npx for one-time usage
npx tuxcare-eportal-mcp --help
```

### Via GitHub

```bash
# Install directly from GitHub
npm install -g github:Revmagi/tuxcare-eportal-mcp
```

## Usage

### Command Line

```bash
# Using config file
tuxcare-eportal-mcp --config ./config.json

# Using command line options
tuxcare-eportal-mcp --url https://your-eportal.com --auth-type basic --username admin --password secret

# Using API key authentication
tuxcare-eportal-mcp --url https://your-eportal.com --auth-type api_key --api-key your-api-key
```

### Configuration File

Create a `config.json` file:

```json
{
  "eportal_url": "https://your-eportal.com",
  "auth": {
    "type": "basic",
    "username": "admin",
    "password": "your-password"
  }
}
```

For API key authentication:

```json
{
  "eportal_url": "https://your-eportal.com",
  "auth": {
    "type": "api_key",
    "api_key": "your-api-key",
    "header_name": "X-Api-Key"
  }
}
```

### MCP Client Configuration

Add to your MCP client settings:

```json
{
  "mcpServers": {
    "tuxcare-eportal": {
      "command": "tuxcare-eportal-mcp",
      "args": ["--config", "/path/to/config.json"]
    }
  }
}
```

## Available Tools

### Server Management

- `list_servers`: List servers with filtering options
- `register_host`: Register a new host
- `unregister_host`: Unregister a host by hostname, IP, or server ID
- `bulk_unregister_hosts`: Bulk unregister inactive hosts
- `set_server_tags`: Set tags for a server

### Feed Management

- `list_feeds`: List all feeds
- `create_feed`: Create or modify a feed
- `delete_feed`: Delete a feed

### Key Management

- `list_keys`: List registration keys
- `create_key`: Create or modify a registration key
- `delete_key`: Delete a registration key

### Patchset Management

- `list_patchsets`: List patchsets for a feed and product
- `manage_patchsets`: Enable, disable, or manage patchset deployments

### User Management

- `list_users`: List all ePortal users

## Tool Examples

### List Servers

```typescript
// List all servers
await callTool("list_servers", {});

// List servers with filtering
await callTool("list_servers", {
  hostname: "web%",
  tag: "env:production",
  limit: 50
});

// Get server count only
await callTool("list_servers", {
  only_count: true
});
```

### Register Host

```typescript
await callTool("register_host", {
  key: "production-key",
  hostname: "web-server-01"
});
```

### Manage Patchsets

```typescript
// Enable a patchset
await callTool("manage_patchsets", {
  patchset: "K20240101_01",
  feed: ["main", "staging"],
  action: "enable",
  product: "kernel"
});

// Enable all patchsets up to a specific one
await callTool("manage_patchsets", {
  patchset: "K20240101_01",
  feed: ["main"],
  action: "enable-upto",
  product: "kernel"
});
```

### Set Server Tags

```typescript
await callTool("set_server_tags", {
  server_id: "abc123",
  tags: "env:production;team:platform;ubuntu"
});
```

## Authentication

The server supports two authentication methods:

### Basic Authentication

```json
{
  "auth": {
    "type": "basic",
    "username": "your-username",
    "password": "your-password"
  }
}
```

### API Key Authentication

```json
{
  "auth": {
    "type": "api_key",
    "api_key": "your-api-key",
    "header_name": "X-Api-Key"
  }
}
```

## Error Handling

The server provides comprehensive error handling:

- **Authentication errors**: Clear messages for credential issues
- **API errors**: Detailed error messages from the ePortal API
- **Validation errors**: Input validation with helpful error messages
- **Network errors**: Timeout and connection error handling

## Development

### Setup

```bash
git clone https://github.com/Revmagi/tuxcare-eportal-mcp.git
cd tuxcare-eportal-mcp
npm install
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/Revmagi/tuxcare-eportal-mcp/issues)
- **Documentation**: [TuxCare Documentation](https://tuxcare.com/docs/)
- **ePortal API**: See the ePortal API documentation for detailed API reference

## Version History

- **1.0.0**: Initial release with full ePortal API support
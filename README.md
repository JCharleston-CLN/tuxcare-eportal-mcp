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

## Installation Options

### Option 1: NPM Global Installation (Recommended)

```bash
# Install globally from npm
npm install -g tuxcare-eportal-mcp

# Verify installation
tuxcare-eportal-mcp --help
```

### Option 2: NPX (No Installation Required)

```bash
# Run directly with npx
npx tuxcare-eportal-mcp --help

# Use in MCP configuration with npx
npx tuxcare-eportal-mcp --url https://your-eportal.com --auth-type basic --username admin --password secret
```

### Option 3: GitHub Installation

```bash
# Install directly from GitHub
npm install -g github:Revmagi/tuxcare-eportal-mcp

# Or clone and install locally
git clone https://github.com/Revmagi/tuxcare-eportal-mcp.git
cd tuxcare-eportal-mcp
npm install
npm run build
npm link
```

## Configuration Guide

### Configuration Methods

You can configure the MCP server in three ways:

1. **Configuration File** (recommended for permanent setups)
2. **Command Line Arguments** (good for testing and Claude Code)
3. **Environment Variables** (for containerized deployments)

### Method 1: Configuration File

Create a configuration file in JSON format:

**Basic Authentication Example (`config.json`):**
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

**API Key Authentication Example (`config.json`):**
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

#### Configuration File Locations

The server looks for configuration files in the following order:

1. **Specified path**: `--config /path/to/config.json`
2. **Current directory**: `./config.json`
3. **Home directory**: `~/.tuxcare-eportal-mcp/config.json`
4. **System directory**: `/etc/tuxcare-eportal-mcp/config.json`

### Method 2: Command Line Arguments

You can pass all configuration via command line arguments:

```bash
# Basic authentication
tuxcare-eportal-mcp \
  --url https://your-eportal.com \
  --auth-type basic \
  --username admin \
  --password your-password

# API key authentication
tuxcare-eportal-mcp \
  --url https://your-eportal.com \
  --auth-type api_key \
  --api-key your-api-key \
  --header-name X-Api-Key
```

### Method 3: Environment Variables

Set environment variables for secure configuration:

```bash
export TUXCARE_EPORTAL_URL="https://your-eportal.com"
export TUXCARE_AUTH_TYPE="basic"
export TUXCARE_USERNAME="admin"
export TUXCARE_PASSWORD="your-password"

# Or for API key
export TUXCARE_AUTH_TYPE="api_key"
export TUXCARE_API_KEY="your-api-key"
export TUXCARE_HEADER_NAME="X-Api-Key"
```

## MCP Client Configuration

### Claude Code Configuration

#### Method 1: Using Configuration File

1. Create a config file in your project directory:
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

2. Add to your Claude Code MCP settings:
   ```json
   {
     "mcpServers": {
       "tuxcare-eportal": {
         "command": "npx",
         "args": ["tuxcare-eportal-mcp", "--config", "./config.json"]
       }
     }
   }
   ```

#### Method 2: Using Command Line Arguments (No Config File)

Add to your Claude Code MCP settings:
```json
{
  "mcpServers": {
    "tuxcare-eportal": {
      "command": "npx",
      "args": [
        "tuxcare-eportal-mcp",
        "--url", "https://your-eportal.com",
        "--auth-type", "basic",
        "--username", "admin",
        "--password", "your-password"
      ]
    }
  }
}
```

#### Method 3: Using Environment Variables

1. Set environment variables in your shell:
   ```bash
   export TUXCARE_EPORTAL_URL="https://your-eportal.com"
   export TUXCARE_AUTH_TYPE="basic"
   export TUXCARE_USERNAME="admin"
   export TUXCARE_PASSWORD="your-password"
   ```

2. Add to Claude Code MCP settings:
   ```json
   {
     "mcpServers": {
       "tuxcare-eportal": {
         "command": "npx",
         "args": ["tuxcare-eportal-mcp"],
         "env": {
           "TUXCARE_EPORTAL_URL": "https://your-eportal.com",
           "TUXCARE_AUTH_TYPE": "basic",
           "TUXCARE_USERNAME": "admin",
           "TUXCARE_PASSWORD": "your-password"
         }
       }
     }
   }
   ```

### Continue.dev Configuration

Add to your `continue.json`:
```json
{
  "mcpServers": {
    "tuxcare-eportal": {
      "command": "npx",
      "args": ["tuxcare-eportal-mcp", "--config", "./config.json"]
    }
  }
}
```

### Cline Configuration

Add to your MCP settings:
```json
{
  "mcpServers": {
    "tuxcare-eportal": {
      "command": "tuxcare-eportal-mcp",
      "args": [
        "--url", "https://your-eportal.com",
        "--auth-type", "basic",
        "--username", "admin",
        "--password", "your-password"
      ]
    }
  }
}
```

### Generic MCP Client Configuration

For any MCP client, use this format:
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

## Configuration Setup Commands

### Quick Setup Command

Generate a configuration file interactively:
```bash
# Create config file with prompts
npx tuxcare-eportal-mcp --setup

# Create config file with basic auth
npx tuxcare-eportal-mcp --setup --url https://your-eportal.com --auth-type basic

# Create config file with API key
npx tuxcare-eportal-mcp --setup --url https://your-eportal.com --auth-type api_key
```

### Test Configuration

Verify your configuration works:
```bash
# Test with config file
tuxcare-eportal-mcp --config ./config.json --test

# Test with command line args
tuxcare-eportal-mcp --url https://your-eportal.com --auth-type basic --username admin --password secret --test
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

## Tool Usage Examples

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

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for sensitive data
3. **Restrict file permissions** on config files: `chmod 600 config.json`
4. **Use API keys** instead of passwords when possible
5. **Rotate credentials** regularly
6. **Use HTTPS** for all ePortal connections

## Troubleshooting

### Common Issues

#### Connection Errors
```bash
# Test connection
curl -v https://your-eportal.com/api/v1/servers

# Check DNS resolution
nslookup your-eportal.com
```

#### Authentication Failures
```bash
# Test basic auth
curl -u username:password https://your-eportal.com/api/v1/servers

# Test API key
curl -H "X-Api-Key: your-key" https://your-eportal.com/api/v1/servers
```

#### Configuration Issues
```bash
# Validate configuration file
npx tuxcare-eportal-mcp --config ./config.json --validate

# Show current configuration
npx tuxcare-eportal-mcp --config ./config.json --show-config
```

### Debug Mode

Enable debug logging:
```bash
# Debug mode
DEBUG=tuxcare:* tuxcare-eportal-mcp --config ./config.json

# Verbose output
tuxcare-eportal-mcp --config ./config.json --verbose
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
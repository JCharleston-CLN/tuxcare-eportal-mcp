# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TuxCare ePortal MCP server - a Model Context Protocol (MCP) server that integrates with TuxCare ePortal API. It provides MCP tools for managing servers, feeds, registration keys, patchsets, and users through the ePortal API.

## Build Commands

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Development mode with auto-reload
npm run dev

# Run the server
npm start

# Run tests
npm test

# Lint code
npm run lint
npm run lint:fix
```

## Project Structure

- `src/` - TypeScript source code
  - `index.ts` - Main entry point and CLI interface
  - `utils/` - Utility modules
    - `auth.ts` - Authentication management (basic auth, API keys)
    - `api-client.ts` - ePortal API client with full endpoint coverage
  - `tools/` - MCP tool implementations
    - `servers.ts` - Server management tools (list, register, unregister, bulk operations, tagging)
    - `feeds.ts` - Feed management tools (CRUD operations)
    - `keys.ts` - Registration key management tools
    - `patchsets.ts` - Patchset management tools (list, deploy actions)
    - `users.ts` - User management tools
- `examples/` - Configuration examples
- `dist/` - Compiled JavaScript (generated)
- `logs/` - Application logs

## Architecture

The MCP server architecture:
- **Main Server**: `TuxCareEPortalMCP` class handles MCP protocol communication
- **API Client**: `EPortalClient` class provides typed interface to ePortal API
- **Authentication**: `AuthManager` handles both basic auth and API key authentication
- **Tools**: Each tool category has its own module with validation and error handling
- **CLI Interface**: Commander.js provides command-line interface with config file support

## Authentication

The server supports two authentication methods:
1. **Basic Authentication**: Username/password with Authorization header
2. **API Key Authentication**: API key with X-Api-Key header (or custom header)

## Available MCP Tools

### Server Management
- `list_servers` - List servers with advanced filtering (hostname, IP, tags, age, etc.)
- `register_host` - Register new hosts with ePortal
- `unregister_host` - Remove servers by hostname, IP, or server ID
- `bulk_unregister_hosts` - Bulk cleanup of inactive servers
- `set_server_tags` - Manage server tags

### Feed Management
- `list_feeds` - List all feeds
- `create_feed` - Create/modify feeds with auto-update settings
- `delete_feed` - Delete feeds (except main feed)

### Key Management
- `list_keys` - List registration keys
- `create_key` - Create/modify registration keys with feed association
- `delete_key` - Delete registration keys

### Patchset Management
- `list_patchsets` - List patchsets by feed and product type
- `manage_patchsets` - Enable, disable, or bulk manage patchsets

### User Management
- `list_users` - List ePortal users

## Configuration

The server accepts configuration via:
1. **Config file**: JSON file with ePortal URL and auth settings
2. **Command line**: Direct CLI arguments for all settings
3. **Environment variables**: (not implemented yet)

## Error Handling

- Input validation using Zod schemas
- Comprehensive API error handling with user-friendly messages
- Authentication error detection and reporting
- Network timeout and connection error handling

## Development Notes

- Written in TypeScript with strict type checking
- Uses @modelcontextprotocol/sdk for MCP protocol implementation
- Axios for HTTP client with interceptors for auth and error handling
- Zod for runtime type validation and schema enforcement
- Commander.js for CLI interface
- ESLint for code quality
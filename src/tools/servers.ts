import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { EPortalClient } from '../utils/api-client.js';

const ListServersSchema = z.object({
  hostname: z.string().optional(),
  ip: z.string().optional(),
  service_id: z.string().optional(),
  feed: z.string().optional(),
  key: z.string().optional(),
  registered_age: z.number().optional(),
  checkin_age: z.number().optional(),
  updated_age: z.number().optional(),
  is_updated: z.boolean().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  only_count: z.boolean().optional(),
  tag: z.string().optional()
});

const RegisterHostSchema = z.object({
  key: z.string(),
  hostname: z.string().optional()
});

const UnregisterHostSchema = z.object({
  hostname: z.string().optional(),
  ip: z.string().optional(),
  server_id: z.string().optional()
}).refine(data => data.hostname || data.ip || data.server_id, {
  message: "At least one of hostname, ip, or server_id must be provided"
});

const BulkUnregisterSchema = z.object({
  checkin_age: z.number().min(1)
});

const SetTagsSchema = z.object({
  server_id: z.string(),
  tags: z.string().optional()
});

export function registerServerTools(tools: Map<string, Tool>): void {
  tools.set("list_servers", {
    name: "list_servers",
    description: "List servers with optional filtering by hostname, IP, service ID, feed, key, age, update status, and tags",
    inputSchema: {
      type: "object",
      properties: {
        hostname: { type: "string", description: "Filter servers by hostname (can contain % wildcard)" },
        ip: { type: "string", description: "Filter servers by IP address (can contain % wildcard)" },
        service_id: { type: "string", description: "Return a single server with matching service ID" },
        feed: { type: "string", description: "Filter servers attached to specific feed (use 'main' for default)" },
        key: { type: "string", description: "Filter servers registered to specific key" },
        registered_age: { type: "number", description: "Filter servers registered more than N days ago (negative for less than N days)" },
        checkin_age: { type: "number", description: "Filter servers that checked in more than N days ago (negative for less than N days)" },
        updated_age: { type: "number", description: "Filter servers updated more than N days ago (negative for less than N days)" },
        is_updated: { type: "boolean", description: "Filter by update status (true for updated, false for not updated)" },
        limit: { type: "number", description: "Limit number of results (default: 10, max: 1000)" },
        offset: { type: "number", description: "Set result offset for pagination" },
        only_count: { type: "boolean", description: "Return only server count, not full results" },
        tag: { type: "string", description: "Filter servers by tag (e.g., 'env:test' or 'ubuntu')" }
      },
      additionalProperties: false
    }
  });

  tools.set("register_host", {
    name: "register_host",
    description: "Register a new host with the specified key and optional hostname",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "ePortal registration key" },
        hostname: { type: "string", description: "Server hostname (optional)" }
      },
      required: ["key"],
      additionalProperties: false
    }
  });

  tools.set("unregister_host", {
    name: "unregister_host",
    description: "Unregister a host by hostname, IP address, or server ID",
    inputSchema: {
      type: "object",
      properties: {
        hostname: { type: "string", description: "Server hostname to unregister" },
        ip: { type: "string", description: "Server IP address to unregister" },
        server_id: { type: "string", description: "Server ID to unregister" }
      },
      additionalProperties: false
    }
  });

  tools.set("bulk_unregister_hosts", {
    name: "bulk_unregister_hosts",
    description: "Bulk unregister hosts that haven't checked in for specified number of days",
    inputSchema: {
      type: "object",
      properties: {
        checkin_age: { type: "number", description: "Remove servers that haven't checked in for this many days (minimum: 1)" }
      },
      required: ["checkin_age"],
      additionalProperties: false
    }
  });

  tools.set("set_server_tags", {
    name: "set_server_tags",
    description: "Set tags for a server (semicolon-separated)",
    inputSchema: {
      type: "object",
      properties: {
        server_id: { type: "string", description: "Server ID to set tags for" },
        tags: { type: "string", description: "Semicolon-separated tags (e.g., 'test;stage;ubuntu'). Omit to remove all tags." }
      },
      required: ["server_id"],
      additionalProperties: false
    }
  });
}

export async function handleServerTool(name: string, args: any, client: EPortalClient) {
  try {
    switch (name) {
      case "list_servers": {
        const parsed = ListServersSchema.parse(args);
        const response = await client.listServers(parsed);
        
        if (parsed.only_count) {
          return {
            content: [{ 
              type: "text", 
              text: `Total servers: ${response.count}` 
            }]
          };
        }
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response, null, 2)
          }]
        };
      }

      case "register_host": {
        const parsed = RegisterHostSchema.parse(args);
        const response = await client.registerHost(parsed.key, parsed.hostname);
        
        return {
          content: [{
            type: "text",
            text: `Host registered successfully. Server ID: ${response.server_id}`
          }]
        };
      }

      case "unregister_host": {
        const parsed = UnregisterHostSchema.parse(args);
        const response = await client.unregisterHost(parsed);
        
        return {
          content: [{
            type: "text", 
            text: `Successfully unregistered ${response.result} server(s)`
          }]
        };
      }

      case "bulk_unregister_hosts": {
        const parsed = BulkUnregisterSchema.parse(args);
        const response = await client.bulkUnregisterHosts(parsed.checkin_age);
        
        return {
          content: [{
            type: "text",
            text: `Successfully unregistered ${response.result} servers that hadn't checked in for ${parsed.checkin_age} days`
          }]
        };
      }

      case "set_server_tags": {
        const parsed = SetTagsSchema.parse(args);
        await client.setTags(parsed.server_id, parsed.tags);
        
        const action = parsed.tags ? `set to: ${parsed.tags}` : "cleared";
        return {
          content: [{
            type: "text",
            text: `Server tags ${action} for server ${parsed.server_id}`
          }]
        };
      }

      default:
        throw new Error(`Unknown server tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ 
        type: "text", 
        text: `Error: ${errorMessage}` 
      }],
      isError: true
    };
  }
}
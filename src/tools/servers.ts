import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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

export function registerServerTools(server: McpServer, client: EPortalClient): void {
  server.registerTool("list_servers",
    {
      title: "List Servers",
      description: "List servers with optional filtering by hostname, IP, service ID, feed, key, age, update status, and tags",
      inputSchema: {
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
      }
    },
    async (args) => {
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
  );

  server.registerTool("register_host",
    {
      title: "Register Host",
      description: "Register a new host with the specified key and optional hostname",
      inputSchema: {
        key: z.string(),
        hostname: z.string().optional()
      }
    },
    async (args) => {
      const parsed = RegisterHostSchema.parse(args);
      const response = await client.registerHost(parsed.key, parsed.hostname);
      
      return {
        content: [{
          type: "text",
          text: `Host registered successfully. Server ID: ${response.server_id}`
        }]
      };
    }
  );

  server.registerTool("unregister_host",
    {
      title: "Unregister Host",
      description: "Unregister a host by hostname, IP address, or server ID",
      inputSchema: {
        hostname: z.string().optional(),
        ip: z.string().optional(),
        server_id: z.string().optional()
      }
    },
    async (args) => {
      const parsed = UnregisterHostSchema.parse(args);
      const response = await client.unregisterHost(parsed);
      
      return {
        content: [{
          type: "text", 
          text: `Successfully unregistered ${response.result} server(s)`
        }]
      };
    }
  );

  server.registerTool("bulk_unregister_hosts",
    {
      title: "Bulk Unregister Hosts",
      description: "Bulk unregister hosts that haven't checked in for specified number of days",
      inputSchema: {
        checkin_age: z.number().min(1)
      }
    },
    async (args) => {
      const parsed = BulkUnregisterSchema.parse(args);
      const response = await client.bulkUnregisterHosts(parsed.checkin_age);
      
      return {
        content: [{
          type: "text",
          text: `Successfully unregistered ${response.result} servers that hadn't checked in for ${parsed.checkin_age} days`
        }]
      };
    }
  );

  server.registerTool("set_server_tags",
    {
      title: "Set Server Tags",
      description: "Set tags for a server (semicolon-separated)",
      inputSchema: {
        server_id: z.string(),
        tags: z.string().optional()
      }
    },
    async (args) => {
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
  );
}
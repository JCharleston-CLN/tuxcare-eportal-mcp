import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { EPortalClient } from '../utils/api-client.js';

const CreateKeySchema = z.object({
  key: z.string().optional(),
  feed: z.string().optional(),
  note: z.string().optional(),
  server_limit: z.number().min(0).optional()
});

const DeleteKeySchema = z.object({
  key: z.string()
});

export function registerKeyTools(server: McpServer, client: EPortalClient): void {
  server.registerTool("list_keys",
    {
      title: "List Keys",
      description: "List all existing registration keys",
      inputSchema: {}
    },
    async () => {
      const response = await client.listKeys();
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response, null, 2)
        }]
      };
    }
  );

  server.registerTool("create_key",
    {
      title: "Create Key",
      description: "Create a new registration key or modify an existing one",
      inputSchema: {
        key: z.string().optional(),
        feed: z.string().optional(),
        note: z.string().optional(),
        server_limit: z.number().min(0).optional()
      }
    },
    async (args) => {
      const parsed = CreateKeySchema.parse(args);
      const response = await client.createOrModifyKey(parsed);
      
      const keyName = parsed.key || response.result.key;
      return {
        content: [{
          type: "text",
          text: `Registration key "${keyName}" created/modified successfully:\n${JSON.stringify(response.result, null, 2)}`
        }]
      };
    }
  );

  server.registerTool("delete_key",
    {
      title: "Delete Key",
      description: "Delete an existing registration key",
      inputSchema: {
        key: z.string()
      }
    },
    async (args) => {
      const parsed = DeleteKeySchema.parse(args);
      const response = await client.deleteKey(parsed.key);
      
      if (response.result === 0) {
        return {
          content: [{
            type: "text",
            text: `Registration key "${parsed.key}" was not found or already deleted`
          }]
        };
      }
      
      return {
        content: [{
          type: "text",
          text: `Registration key "${parsed.key}" deleted successfully`
        }]
      };
    }
  );
}
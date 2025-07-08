import { Tool } from '@modelcontextprotocol/sdk/types.js';
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

export function registerKeyTools(tools: Map<string, Tool>): void {
  tools.set("list_keys", {
    name: "list_keys",
    description: "List all existing registration keys",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  });

  tools.set("create_key", {
    name: "create_key",
    description: "Create a new registration key or modify an existing one",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Registration key name (if empty, a random key will be generated)" },
        feed: { type: "string", description: "Feed to attach the key to (default: 'main')" },
        note: { type: "string", description: "Description/note for the key" },
        server_limit: { type: "number", description: "Advisory limit for maximum number of hosts that can register with this key (0 = no limit)" }
      },
      additionalProperties: false
    }
  });

  tools.set("delete_key", {
    name: "delete_key",
    description: "Delete an existing registration key",
    inputSchema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Registration key name to delete" }
      },
      required: ["key"],
      additionalProperties: false
    }
  });
}

export async function handleKeyTool(name: string, args: any, client: EPortalClient) {
  try {
    switch (name) {
      case "list_keys": {
        const response = await client.listKeys();
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response, null, 2)
          }]
        };
      }

      case "create_key": {
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

      case "delete_key": {
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

      default:
        throw new Error(`Unknown key tool: ${name}`);
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
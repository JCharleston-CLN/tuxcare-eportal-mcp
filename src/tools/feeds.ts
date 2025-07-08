import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { EPortalClient } from '../utils/api-client.js';

const CreateFeedSchema = z.object({
  name: z.string(),
  auto: z.boolean().optional(),
  deploy_after: z.number().min(0).optional()
});

const DeleteFeedSchema = z.object({
  name: z.string()
});

export function registerFeedTools(tools: Map<string, Tool>): void {
  tools.set("list_feeds", {
    name: "list_feeds",
    description: "List all existing feeds",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  });

  tools.set("create_feed", {
    name: "create_feed",
    description: "Create a new feed or modify an existing one",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name of the feed to create or modify" },
        auto: { type: "boolean", description: "Enable auto-update for the feed (default: false)" },
        deploy_after: { type: "number", description: "Delayed deployment period in hours (default: 0)" }
      },
      required: ["name"],
      additionalProperties: false
    }
  });

  tools.set("delete_feed", {
    name: "delete_feed",
    description: "Delete an existing feed (note: 'main' feed cannot be deleted)",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name of the feed to delete" }
      },
      required: ["name"],
      additionalProperties: false
    }
  });
}

export async function handleFeedTool(name: string, args: any, client: EPortalClient) {
  try {
    switch (name) {
      case "list_feeds": {
        const response = await client.listFeeds();
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response, null, 2)
          }]
        };
      }

      case "create_feed": {
        const parsed = CreateFeedSchema.parse(args);
        const response = await client.createOrModifyFeed(parsed);
        
        return {
          content: [{
            type: "text",
            text: `Feed "${parsed.name}" created/modified successfully:\n${JSON.stringify(response.result, null, 2)}`
          }]
        };
      }

      case "delete_feed": {
        const parsed = DeleteFeedSchema.parse(args);
        
        if (parsed.name === 'main') {
          throw new Error('Cannot delete the "main" feed');
        }
        
        const response = await client.deleteFeed(parsed.name);
        
        if (response.result === 0) {
          return {
            content: [{
              type: "text",
              text: `Feed "${parsed.name}" was not found or already deleted`
            }]
          };
        }
        
        return {
          content: [{
            type: "text",
            text: `Feed "${parsed.name}" deleted successfully`
          }]
        };
      }

      default:
        throw new Error(`Unknown feed tool: ${name}`);
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
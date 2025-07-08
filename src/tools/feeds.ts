import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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

export function registerFeedTools(server: McpServer, client: EPortalClient): void {
  server.registerTool("list_feeds",
    {
      title: "List Feeds",
      description: "List all existing feeds",
      inputSchema: {}
    },
    async () => {
      const response = await client.listFeeds();
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response, null, 2)
        }]
      };
    }
  );

  server.registerTool("create_feed",
    {
      title: "Create Feed",
      description: "Create a new feed or modify an existing one",
      inputSchema: {
        name: z.string(),
        auto: z.boolean().optional(),
        deploy_after: z.number().min(0).optional()
      }
    },
    async (args) => {
      const parsed = CreateFeedSchema.parse(args);
      const response = await client.createOrModifyFeed(parsed);
      
      return {
        content: [{
          type: "text",
          text: `Feed "${parsed.name}" created/modified successfully:\n${JSON.stringify(response.result, null, 2)}`
        }]
      };
    }
  );

  server.registerTool("delete_feed",
    {
      title: "Delete Feed",
      description: "Delete an existing feed (note: 'main' feed cannot be deleted)",
      inputSchema: {
        name: z.string()
      }
    },
    async (args) => {
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
  );
}
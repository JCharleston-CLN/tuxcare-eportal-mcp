import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { EPortalClient } from '../utils/api-client.js';

const ListPatchsetsSchema = z.object({
  feed: z.string().optional(),
  product: z.enum(['kernel', 'user', 'qemu', 'db']).optional()
});

const ManagePatchsetsSchema = z.object({
  patchset: z.string(),
  feed: z.union([z.string(), z.array(z.string())]).transform(val => 
    Array.isArray(val) ? val : [val]
  ),
  action: z.enum(['enable', 'disable', 'enable-upto', 'undeploy-downto']),
  product: z.enum(['kernel', 'user', 'qemu', 'db']).optional()
});

export function registerPatchsetTools(server: McpServer, client: EPortalClient): void {
  server.registerTool("list_patchsets",
    {
      title: "List Patchsets",
      description: "List available patchsets for a feed and product",
      inputSchema: {
        feed: z.string().optional(),
        product: z.enum(['kernel', 'user', 'qemu', 'db']).optional()
      }
    },
    async (args) => {
      const parsed = ListPatchsetsSchema.parse(args);
      const response = await client.listPatchsets(parsed);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response, null, 2)
        }]
      };
    }
  );

  server.registerTool("manage_patchsets",
    {
      title: "Manage Patchsets",
      description: "Perform deployment actions on patchsets",
      inputSchema: {
        patchset: z.string(),
        feed: z.union([z.string(), z.array(z.string())]),
        action: z.enum(['enable', 'disable', 'enable-upto', 'undeploy-downto']),
        product: z.enum(['kernel', 'user', 'qemu', 'db']).optional()
      }
    },
    async (args) => {
      const parsed = ManagePatchsetsSchema.parse(args);
      await client.managePatchsets(parsed);
      
      const feedList = parsed.feed.join(', ');
      const actionDescription = getActionDescription(parsed.action);
      
      return {
        content: [{
          type: "text",
          text: `Patchset "${parsed.patchset}" ${actionDescription} successfully on feed(s): ${feedList}`
        }]
      };
    }
  );
}

function getActionDescription(action: string): string {
  switch (action) {
    case 'enable':
      return 'enabled';
    case 'disable':
      return 'disabled';
    case 'enable-upto':
      return 'and all older patchsets enabled';
    case 'undeploy-downto':
      return 'and all newer patchsets undeployed';
    default:
      return 'processed';
  }
}
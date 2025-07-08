import { Tool } from '@modelcontextprotocol/sdk/types.js';
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

export function registerPatchsetTools(tools: Map<string, Tool>): void {
  tools.set("list_patchsets", {
    name: "list_patchsets",
    description: "List available patchsets for a feed and product",
    inputSchema: {
      type: "object",
      properties: {
        feed: { type: "string", description: "Feed name to list patchsets for (default: 'main')" },
        product: { type: "string", enum: ["kernel", "user", "qemu", "db"], description: "Product type to list patchsets for (default: 'kernel')" }
      },
      additionalProperties: false
    }
  });

  tools.set("manage_patchsets", {
    name: "manage_patchsets",
    description: "Perform deployment actions on patchsets",
    inputSchema: {
      type: "object",
      properties: {
        patchset: { type: "string", description: "Name of the patchset to operate on" },
        feed: { 
          oneOf: [
            { type: "string" },
            { type: "array", items: { type: "string" } }
          ],
          description: "Feed name(s) to operate on"
        },
        action: { 
          type: "string", 
          enum: ["enable", "disable", "enable-upto", "undeploy-downto"],
          description: "Action to perform: enable (enable patchset), disable (disable patchset), enable-upto (enable all patchsets up to specified), undeploy-downto (undeploy all patchsets down to specified)"
        },
        product: { type: "string", enum: ["kernel", "user", "qemu", "db"], description: "Product type to operate on (default: 'kernel')" }
      },
      required: ["patchset", "feed", "action"],
      additionalProperties: false
    }
  });
}

export async function handlePatchsetTool(name: string, args: any, client: EPortalClient) {
  try {
    switch (name) {
      case "list_patchsets": {
        const parsed = ListPatchsetsSchema.parse(args);
        const response = await client.listPatchsets(parsed);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response, null, 2)
          }]
        };
      }

      case "manage_patchsets": {
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

      default:
        throw new Error(`Unknown patchset tool: ${name}`);
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
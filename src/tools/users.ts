import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { EPortalClient } from '../utils/api-client.js';

export function registerUserTools(tools: Map<string, Tool>): void {
  tools.set("list_users", {
    name: "list_users",
    description: "List all existing users in the ePortal system",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  });
}

export async function handleUserTool(name: string, _args: any, client: EPortalClient) {
  try {
    switch (name) {
      case "list_users": {
        const response = await client.listUsers();
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response, null, 2)
          }]
        };
      }

      default:
        throw new Error(`Unknown user tool: ${name}`);
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
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { EPortalClient } from '../utils/api-client.js';

export function registerUserTools(server: McpServer, client: EPortalClient): void {
  server.registerTool("list_users",
    {
      title: "List Users",
      description: "List all existing users in the ePortal system",
      inputSchema: {}
    },
    async () => {
      const response = await client.listUsers();
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response, null, 2)
        }]
      };
    }
  );
}
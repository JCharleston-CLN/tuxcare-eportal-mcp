import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { EPortalClient } from './api-client.js';

export type ToolHandler = (args: any, client: EPortalClient) => Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}>;

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private handlers: Map<string, ToolHandler> = new Map();

  addTool(tool: Tool, handler: ToolHandler): void {
    this.tools.set(tool.name, tool);
    this.handlers.set(tool.name, handler);
  }

  registerWithServer(server: Server, client: EPortalClient): void {
    // Register all tools
    for (const tool of this.tools.values()) {
      server.addTool(tool);
    }

    // Set up the handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      const handler = this.handlers.get(name);
      if (!handler) {
        return {
          content: [{ 
            type: "text", 
            text: `Tool ${name} not found` 
          }],
          isError: true
        };
      }

      try {
        return await handler(args, client);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{ 
            type: "text", 
            text: `Error executing tool ${name}: ${errorMessage}` 
          }],
          isError: true
        };
      }
    });
  }
}
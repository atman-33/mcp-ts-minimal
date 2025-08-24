#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Input schema for the echo tool
const HelloToolInputSchema = z.object({
  message: z.string(),
});

// Create the server
const server = new Server(
  {
    name: 'mcp-minimal',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'hello':
      return {
        content: [{ type: 'text', text: 'Hello from MCP server' }],
      };

    case 'echo': {
      const parsed = HelloToolInputSchema.safeParse(args);
      if (!parsed.success) {
        return {
          content: [
            { type: 'text', text: `Invalid arguments: ${parsed.error}` },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text', text: `Echo: ${parsed.data.message}` }],
      };
    }

    default:
      return {
        content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

// Start the server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Minimal Server running on stdio');
}

// Run the server and handle fatal errors
runServer().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Aliyun MCP Server
 * 
 * This server provides tools for interacting with Aliyun (Alibaba Cloud) services:
 * - SLS (Simple Log Service) log querying
 * - ECS (Elastic Compute Service) management
 * - FC (Function Compute) deployment
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  McpError,
  ErrorCode
} from "@modelcontextprotocol/sdk/types.js";

// Import Aliyun service implementations
import { SLSService, SLSQueryParams } from "./services/sls.js";

/**
 * Create an MCP server with capabilities for Aliyun services
 */
const server = new Server(
  {
    name: "aliyun-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * Handler for listing available resources.
 * Currently, no resources are exposed.
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: []
  };
});

/**
 * Handler for reading resources.
 * Currently, no resources are implemented.
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  throw new McpError(
    ErrorCode.MethodNotFound,
    `Resource not found: ${request.params.uri}`
  );
});

/**
 * Handler that lists available tools.
 * Exposes Aliyun service tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "querySLSLogs",
        description: "Query Aliyun SLS (Simple Log Service) logs",
        inputSchema: {
          type: "object",
          properties: {
            project: {
              type: "string",
              description: "SLS project name"
            },
            logstore: {
              type: "string",
              description: "SLS logstore name"
            },
            query: {
              type: "string",
              description: "SLS query statement"
            },
            from: {
              type: "number",
              description: "Start time in milliseconds (defaults to 1 hour ago)"
            },
            to: {
              type: "number",
              description: "End time in milliseconds (defaults to now)"
            },
            limit: {
              type: "number",
              description: "Maximum number of logs to return (default: 100, max: 1000)"
            },
            offset: {
              type: "number",
              description: "Offset for pagination (default: 0)"
            },
            reverse: {
              type: "boolean",
              description: "Whether to return results in reverse order (default: false)"
            }
          },
          required: ["project", "logstore", "query"]
        }
      }
    ]
  };
});

/**
 * Handler for Aliyun service tools.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`[Tool] Executing tool: ${request.params.name}`);

  switch (request.params.name) {
    case "querySLSLogs": {
      try {
        // Cast arguments to SLSQueryParams with proper type checking
        const args = request.params.arguments || {};
        const params: SLSQueryParams = {
          project: String(args.project || ''),
          logstore: String(args.logstore || ''),
          query: String(args.query || ''),
          from: typeof args.from === 'number' ? args.from : undefined,
          to: typeof args.to === 'number' ? args.to : undefined,
          limit: typeof args.limit === 'number' ? args.limit : undefined,
          offset: typeof args.offset === 'number' ? args.offset : undefined,
          reverse: typeof args.reverse === 'boolean' ? args.reverse : undefined
        };

        if (!params.project || !params.logstore || !params.query) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Missing required parameters: project, logstore, and query are required"
          );
        }

        const result = await SLSService.queryLogs(params);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        console.error('[Tool] Error executing querySLSLogs:', error);

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Error querying SLS logs: ${error.message || 'Unknown error'}`
        );
      }
    }

    default:
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
  }
});


/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

#!/usr/bin/env node

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { MiroClient } from "./MiroClient.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs/promises';
import path from 'path';
import { 
  getAllToolDefinitions,
  handleToolRequest
} from "./tools/index.js";

// Parse command line arguments
const argv = await yargs(hideBin(process.argv))
  .option("token", {
    alias: "t",
    type: "string",
    description: "Miro OAuth token",
  })
  .help().argv;

// Get token with precedence: command line > environment variable
const oauthToken = (argv.token as string) || process.env.MIRO_OAUTH_TOKEN;

if (!oauthToken) {
  console.error(
    "Error: Miro OAuth token is required. Provide it via MIRO_OAUTH_TOKEN environment variable or --token argument"
  );
  process.exit(1);
}

const server = new Server(
  {
    name: "mcp-miro",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

const miroClient = new MiroClient(oauthToken);

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const boards = await miroClient.getBoards();

  return {
    resources: boards.map((board) => ({
      uri: `miro://board/${board.id}`,
      mimeType: "application/json",
      name: board.name,
      description: board.description || `Miro board: ${board.name}`,
    })),
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);

  if (!request.params.uri.startsWith("miro://board/")) {
    throw new Error(
      "Invalid Miro resource URI - must start with miro://board/"
    );
  }

  const boardId = url.pathname.substring(1); // Remove leading slash from pathname
  const items = await miroClient.getBoardItems(boardId);

  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: "application/json",
        text: JSON.stringify(items, null, 2),
      },
    ],
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: getAllToolDefinitions()
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return handleToolRequest(request.params.name, request.params.arguments, miroClient);
});

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "Working with MIRO",
        description: "Basic prompt for working with MIRO boards",
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name === "Working with MIRO") {
    const keyFactsPath = path.join(process.cwd(), 'resources', 'boards-key-facts.md');
    const keyFacts = await fs.readFile(keyFactsPath, 'utf-8');
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: keyFacts,
          },
        },
      ],
    };
  }
  throw new Error("Unknown prompt");
});

async function main() {
  const transport = new StdioServerTransport();
  
  console.error('Starting server initialization...');
  
  try {
    await server.connect(transport);
    console.error('Server connected successfully');
    
    // Keep the process alive
    process.stdin.resume();
    
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

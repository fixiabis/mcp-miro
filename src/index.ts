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
  imageToolDefinitions, handleImageTools,
  embedToolDefinitions, handleEmbedTools,
  shapeToolDefinitions, handleShapeTools,
  spatialToolDefinitions, handleSpatialTools
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
    tools: [
      // Basic board tools
      {
        name: "list_boards",
        description: "List all available Miro boards and their IDs",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "create_sticky_note",
        description:
          "Create a sticky note on a Miro board. By default, sticky notes are 199x228 and available in these colors: gray, light_yellow, yellow, orange, light_green, green, dark_green, cyan, light_pink, pink, violet, red, light_blue, blue, dark_blue, black.",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description: "ID of the board to create the sticky note on",
            },
            content: {
              type: "string",
              description: "Text content of the sticky note",
            },
            color: {
              type: "string",
              description:
                "Color of the sticky note (e.g. 'yellow', 'blue', 'pink')",
              enum: [
                "gray",
                "light_yellow",
                "yellow",
                "orange",
                "light_green",
                "green",
                "dark_green",
                "cyan",
                "light_pink",
                "pink",
                "violet",
                "red",
                "light_blue",
                "blue",
                "dark_blue",
                "black",
              ],
              default: "yellow",
            },
            x: {
              type: "number",
              description: "X coordinate position",
              default: 0,
            },
            y: {
              type: "number",
              description: "Y coordinate position",
              default: 0,
            },
          },
          required: ["boardId", "content"],
        },
      },
      {
        name: "get_items_in_frame",
        description:
          "Get all items contained within a specific frame on a Miro board",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description: "ID of the board that contains the frame",
            },
            frameId: {
              type: "string",
              description: "ID of the frame to get items from",
            },
          },
          required: ["boardId", "frameId"],
        },
      },
      {
        name: "bulk_create_items",
        description:
          "Create multiple items on a Miro board in a single transaction (max 20 items)",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description: "ID of the board to create the items on",
            },
            items: {
              type: "array",
              description: "Array of items to create",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: [
                      "app_card",
                      "text",
                      "shape",
                      "sticky_note",
                      "image",
                      "document",
                      "card",
                      "frame",
                      "embed",
                    ],
                    description: "Type of item to create",
                  },
                  data: {
                    type: "object",
                    description: "Item-specific data configuration",
                  },
                  style: {
                    type: "object",
                    description: "Item-specific style configuration",
                  },
                  position: {
                    type: "object",
                    description: "Item position configuration",
                  },
                  geometry: {
                    type: "object",
                    description: "Item geometry configuration",
                  },
                  parent: {
                    type: "object",
                    description: "Parent item configuration",
                  },
                },
                required: ["type"],
              },
              minItems: 1,
              maxItems: 20,
            },
          },
          required: ["boardId", "items"],
        },
      },
      {
        name: "get_frames",
        description: "Get all frames from a Miro board",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description: "ID of the board to get frames from",
            },
          },
          required: ["boardId"],
        },
      },
      {
        name: "create_shape",
        description:
          "Create a shape on a Miro board. Available shapes include basic shapes (rectangle, circle, etc.) and flowchart shapes (process, decision, etc.). Standard geometry specs: width and height in pixels (default 200x200)",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description: "ID of the board to create the shape on",
            },
            content: {
              type: "string",
              description: "Text content to display on the shape",
            },
            shape: {
              type: "string",
              description: "Type of shape to create",
              enum: [
                // Basic shapes
                "rectangle",
                "round_rectangle",
                "circle",
                "triangle",
                "rhombus",
                "parallelogram",
                "trapezoid",
                "pentagon",
                "hexagon",
                "octagon",
                "wedge_round_rectangle_callout",
                "star",
                "flow_chart_predefined_process",
                "cloud",
                "cross",
                "can",
                "right_arrow",
                "left_arrow",
                "left_right_arrow",
                "left_brace",
                "right_brace",
                // Flowchart shapes
                "flow_chart_connector",
                "flow_chart_magnetic_disk",
                "flow_chart_input_output",
                "flow_chart_decision",
                "flow_chart_delay",
                "flow_chart_display",
                "flow_chart_document",
                "flow_chart_magnetic_drum",
                "flow_chart_internal_storage",
                "flow_chart_manual_input",
                "flow_chart_manual_operation",
                "flow_chart_merge",
                "flow_chart_multidocuments",
                "flow_chart_note_curly_left",
                "flow_chart_note_curly_right",
                "flow_chart_note_square",
                "flow_chart_offpage_connector",
                "flow_chart_or",
                "flow_chart_predefined_process_2",
                "flow_chart_preparation",
                "flow_chart_process",
                "flow_chart_online_storage",
                "flow_chart_summing_junction",
                "flow_chart_terminator",
              ],
              default: "rectangle",
            },
            style: {
              type: "object",
              description: "Style configuration for the shape",
              properties: {
                borderColor: { type: "string" },
                borderOpacity: { type: "number", minimum: 0, maximum: 1 },
                borderStyle: {
                  type: "string",
                  enum: ["normal", "dotted", "dashed"],
                },
                borderWidth: { type: "number", minimum: 1, maximum: 24 },
                color: { type: "string" },
                fillColor: { type: "string" },
                fillOpacity: { type: "number", minimum: 0, maximum: 1 },
                fontFamily: { type: "string" },
                fontSize: { type: "number", minimum: 10, maximum: 288 },
                textAlign: {
                  type: "string",
                  enum: ["left", "center", "right"],
                },
                textAlignVertical: {
                  type: "string",
                  enum: ["top", "middle", "bottom"],
                },
              },
            },
            position: {
              type: "object",
              properties: {
                x: { type: "number", default: 0 },
                y: { type: "number", default: 0 },
                origin: { type: "string", default: "center" },
              },
            },
            geometry: {
              type: "object",
              properties: {
                width: { type: "number", default: 200 },
                height: { type: "number", default: 200 },
                rotation: { type: "number", default: 0 },
              },
            },
          },
          required: ["boardId", "shape"],
        },
      },
      // Our modular tool definitions
      ...imageToolDefinitions,
      ...embedToolDefinitions,
      ...shapeToolDefinitions,
      ...spatialToolDefinitions,
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments as Record<string, any>;
  
  // Lists of tool names to check for
  const imageTools = imageToolDefinitions.map((tool: {name: string}) => tool.name);
  const embedTools = embedToolDefinitions.map((tool: {name: string}) => tool.name);
  const shapeTools = shapeToolDefinitions.map((tool: {name: string}) => tool.name);
  const spatialTools = spatialToolDefinitions.map((tool: {name: string}) => tool.name);
  
  // Handle the modular tools
  if (imageTools.includes(toolName)) {
    return handleImageTools(toolName, args, miroClient);
  }
  
  if (embedTools.includes(toolName)) {
    return handleEmbedTools(toolName, args, miroClient);
  }
  
  if (shapeTools.includes(toolName)) {
    return handleShapeTools(toolName, args, miroClient);
  }
  
  if (spatialTools.includes(toolName)) {
    return handleSpatialTools(toolName, args, miroClient);
  }
  
  // Handle original tools with a switch statement like the reference repo
  switch (toolName) {
    case "list_boards": {
      const boards = await miroClient.getBoards();
      return {
        content: [
          {
            type: "text",
            text: "Here are the available Miro boards:",
          },
          ...boards.map((b) => ({
            type: "text",
            text: `Board ID: ${b.id}, Name: ${b.name}`,
          })),
        ],
      };
    }

    case "create_sticky_note": {
      const {
        boardId,
        content,
        color = "yellow",
        x = 0,
        y = 0,
      } = args;

      // Based on MiroClient.ts, the method signature is different than what we're using
      const stickyNote = await miroClient.createStickyNote(
        boardId, 
        content,
        { x, y }
      );

      return {
        content: [
          {
            type: "text",
            text: `Created sticky note ${stickyNote.id} on board ${boardId}`,
          },
        ],
      };
    }

    case "bulk_create_items": {
      const { boardId, items } = args;

      const createdItems = await miroClient.bulkCreateItems(boardId, items);

      return {
        content: [
          {
            type: "text",
            text: `Created ${createdItems.length} items on board ${boardId}`,
          },
        ],
      };
    }

    case "get_frames": {
      const { boardId } = args;
      const frames = await miroClient.getFrames(boardId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(frames, null, 2),
          },
        ],
      };
    }

    case "get_items_in_frame": {
      const { boardId, frameId } = args;
      const items = await miroClient.getItemsInFrame(boardId, frameId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(items, null, 2),
          },
        ],
      };
    }

    case "create_shape": {
      const { boardId, shape, content, style, position, geometry } = args;

      const shapeItem = await miroClient.createShape(boardId, {
        data: {
          shape,
          content,
        },
        style: style || {},
        position: position || { x: 0, y: 0 },
        geometry: geometry || { width: 200, height: 200, rotation: 0 },
      });

      return {
        content: [
          {
            type: "text",
            text: `Created ${shape} shape with ID ${shapeItem.id} on board ${boardId}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
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
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

// Keep the process alive
process.stdin.resume();

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

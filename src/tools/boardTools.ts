import { MiroClient } from "../MiroClient.js";

/**
 * Tool definitions for board operations
 */
export const boardToolDefinitions = [
  {
    name: "list_boards",
    description: "List all available Miro boards and their IDs",
    inputSchema: {
      type: "object",
      properties: {},
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
    name: "get_items_in_frame",
    description: "Get all items contained within a specific frame on a Miro board",
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
];

/**
 * Handle board tool requests
 * @param toolName Name of the tool being called
 * @param args Arguments passed to the tool
 * @param miroClient Miro client instance
 * @returns Response formatted for MCP
 */
export async function handleBoardTools(toolName: string, args: any, miroClient: MiroClient) {
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

    default:
      throw new Error(`Unknown board tool: ${toolName}`);
  }
} 
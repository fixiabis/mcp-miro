import { MiroClient } from "../MiroClient.js";

/**
 * Tool definitions for content creation operations
 */
export const contentToolDefinitions = [
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
];

/**
 * Handle content creation tool requests
 * @param toolName Name of the tool being called
 * @param args Arguments passed to the tool
 * @param miroClient Miro client instance
 * @returns Response formatted for MCP
 */
export async function handleContentTools(toolName: string, args: any, miroClient: MiroClient) {
  switch (toolName) {
    case "create_sticky_note": {
      const {
        boardId,
        content,
        color = "yellow",
        x = 0,
        y = 0,
      } = args;

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

    default:
      throw new Error(`Unknown content tool: ${toolName}`);
  }
} 
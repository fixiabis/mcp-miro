import { MiroClient } from "../MiroClient.js";

/**
 * Tool definitions for iframe embedding
 */
export const embedToolDefinitions = [
  {
    name: "create_embed",
    description: "Create an embed (iframe) on a Miro board from a URL. Supports websites, YouTube videos, speckel  etc.",
    input_schema: {
      type: "object",
      properties: {
        boardId: {
          type: "string",
          description: "ID of the board to create the embed on",
        },
        url: {
          type: "string",
          description: "URL to embed (e.g., YouTube video, website, etc.)",
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
        width: {
          type: "number",
          description: "Width of the embed in pixels (optional)",
        },
        height: {
          type: "number",
          description: "Height of the embed in pixels (optional - note: you can specify width OR height, but not both for fixed aspect ratio content)",
        },
        mode: {
          type: "string",
          description: "Display mode for the embed",
          enum: ["inline", "modal"],
          default: "inline",
        },
        previewUrl: {
          type: "string",
          description: "Optional URL for a preview image to display for the embed",
        },
        origin: {
          type: "string",
          description: "Origin point for positioning",
          enum: ["center", "top-left", "top-right", "bottom-left", "bottom-right"],
          default: "center",
        },
      },
      required: ["boardId", "url"],
    },
    output_schema: {
      type: "object",
      properties: {
        content: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              text: { type: "string" },
            },
          },
        },
      },
    },
  }
];

/**
 * Handlers for embed tools
 */
export const handleEmbedTools = async (toolName: string, args: any, miroClient: MiroClient) => {
  switch (toolName) {
    case "create_embed": {
      const { boardId, url, x = 0, y = 0, width, height, mode = "inline", previewUrl, origin = "center" } = args;
      
      // Build geometry object if width or height is provided
      const geometry: { width?: number; height?: number } = {};
      if (width !== undefined) geometry.width = width;
      if (height !== undefined) geometry.height = height;

      // Validate that both width and height aren't provided for fixed aspect ratio content
      if (width !== undefined && height !== undefined) {
        console.warn("For fixed aspect ratio content, you should specify either width OR height, but not both. Using both values as provided.");
      }

      const embed = await miroClient.createEmbed(
        boardId,
        url,
        { x, y, origin },
        Object.keys(geometry).length > 0 ? geometry : undefined,
        mode as 'inline' | 'modal',
        previewUrl
      );

      return {
        content: [
          {
            type: "text",
            text: `Created embed with ID ${embed.id} on board ${boardId}`,
          },
          {
            type: "text",
            text: `Embed dimensions: ${embed.geometry?.width || 'auto'} x ${embed.geometry?.height || 'auto'}`,
          },
          {
            type: "text",
            text: `Provider: ${embed.data?.providerName || 'Unknown'}`,
          }
        ],
      };
    }

    default:
      throw new Error(`Unknown embed tool: ${toolName}`);
  }
}; 
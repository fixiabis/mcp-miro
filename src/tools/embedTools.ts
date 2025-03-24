import { MiroClient, MiroItem } from "../MiroClient.js";

/**
 * Tool definitions for iframe embedding
 */
export const embedToolDefinitions = [
  {
    name: "create_embed",
    description: "Create an embed (iframe) on a Miro board from a URL. Supports websites, YouTube videos, speckel  etc.",
    inputSchema: {
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
      let { boardId, url, x = 0, y = 0, width = 800, height, mode = "inline", previewUrl, origin = "center" } = args;
      
      // For Speckle URLs, ensure we have the embed parameter
      if (url.includes('speckle.systems') && !url.includes('#embed=')) {
        url = `${url}#embed={"isEnabled":true}`;
      }

      // Build geometry object - for fixed aspect ratio content, only specify one dimension
      let geometry: { width?: number; height?: number } | undefined = undefined;
      if (width !== undefined || height !== undefined) {
        geometry = {};
        // Prefer width if both are specified
        if (width !== undefined) {
          geometry.width = width;
        } else if (height !== undefined) {
          geometry.height = height;
        }
      }

      // Prepare embed data
      const embedData = {
        url,
        mode,
        ...(previewUrl ? { previewUrl } : {})
      };

      console.log('Creating embed with:', JSON.stringify({
        data: embedData,
        position: { x, y, origin },
        geometry
      }, null, 2));

      // Create the embed
      const embed = await miroClient.createEmbed(
        boardId,
        embedData,
        { x, y, origin },
        geometry
      );

      // Return response with embed details
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              id: embed.id,
              boardId: boardId,
              url: url,
              mode: embed.data?.mode || mode,
              dimensions: embed.geometry || 'auto',
              provider: embed.data?.providerName || 'Unknown',
              title: embed.data?.title || null
            }, null, 2)
          }
        ],
      };
    }

    default:
      throw new Error(`Unknown embed tool: ${toolName}`);
  }
}; 
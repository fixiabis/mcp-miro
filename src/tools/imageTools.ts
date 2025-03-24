import { MiroClient } from "../MiroClient.js";

/**
 * Tool definitions for image manipulation
 */
export const imageToolDefinitions = [
  {
    name: "create_image",
    description: "Create an image on a Miro board from either a URL or base64 data. When using base64, the data must follow MCP image content type format. For images with fixed aspect ratio, specify either width OR height, not both.",
    inputSchema: {
      type: "object",
      properties: {
        boardId: {
          type: "string",
          description: "ID of the board to create the image on",
        },
        imageData: {
          type: "string",
          description: "Either a URL or base64 encoded image data (must include data URI scheme prefix for base64)",
        },
        isUrl: {
          type: "boolean",
          description: "Whether the imageData is a URL (true) or base64 data (false)",
          default: true,
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
          description: "Width of the image in pixels (optional, don't specify both width and height for fixed aspect ratio images)",
        },
        height: {
          type: "number",
          description: "Height of the image in pixels (optional, don't specify both width and height for fixed aspect ratio images)",
        },
        origin: {
          type: "string",
          description: "Origin point for positioning",
          enum: ["center", "top-left", "top-right", "bottom-left", "bottom-right"],
          default: "center",
        },
      },
      required: ["boardId", "imageData"],
    },
  },
  {
    name: "get_image",
    description: "Get image data from a Miro board item in MCP-compliant format",
    inputSchema: {
      type: "object",
      properties: {
        boardId: {
          type: "string",
          description: "ID of the board containing the image",
        },
        imageId: {
          type: "string",
          description: "ID of the image item to fetch",
        },
        format: {
          type: "string",
          description: "Desired format of the image",
          enum: ["url", "original"],
          default: "original",
        }
      },
      required: ["boardId", "imageId"],
    },
  }
];

/**
 * Handlers for image tools
 */
export const handleImageTools = async (toolName: string, args: any, miroClient: MiroClient) => {
  switch (toolName) {
    case "create_image": {
      const { boardId, imageData, isUrl = true, x = 0, y = 0, width, height, origin = "center" } = args;
      
      // For geometry, only pass width OR height, not both
      let geometry: { width?: number; height?: number } | undefined;
      if (width !== undefined) {
        geometry = { width };
      } else if (height !== undefined) {
        geometry = { height };
      }

      let image;
      if (isUrl) {
        image = await miroClient.createImageByUrl(
          boardId,
          imageData,
          { x, y, origin },
          geometry
        );
      } else {
        // Validate base64 data format according to MCP standards
        if (!imageData.startsWith('data:image/')) {
          throw new Error('Base64 image data must include data URI scheme prefix (e.g., data:image/png;base64,...)');
        }
        
        image = await miroClient.createImageByBase64(
          boardId,
          imageData,
          { x, y, origin },
          geometry
        );
      }

      if (!image.id || !image.type || image.type !== 'image') {
        throw new Error('Invalid response from Miro API');
      }

      // Return in MCP-compliant format
      return {
        content: [
          {
            type: "text",
            text: `Created image with ID ${image.id} on board ${boardId}`,
          },
          {
            type: "text",
            text: JSON.stringify({
              miroImageId: image.id,
              boardId: boardId,
              imageUrl: image.data?.imageUrl,
              dimensions: {
                width: image.geometry?.width,
                height: image.geometry?.height
              },
              requiresAuth: true
            }, null, 2)
          }
        ],
      };
    }

    case "get_image": {
      const { boardId, imageId, format = "original" } = args;
      
      try {
        const image = await miroClient.getItem(boardId, imageId);
        
        if (!image || image.type !== 'image') {
          throw new Error(`Item ${imageId} is not an image`);
        }

        // Get high-resolution URL if original format requested
        const imageUrl = format === "original" && image.data?.imageUrl ? 
          `${image.data.imageUrl}?format=original` : 
          image.data?.imageUrl;

        if (!imageUrl) {
          throw new Error('No image URL available');
        }

        // Fetch the image and convert to base64
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const contentType = response.headers.get('content-type') || 'image/png';

        // Return in MCP-compliant format
        return {
          content: [
            {
              type: "text",
              text: `Retrieved image ${imageId} from board ${boardId}`,
            },
            {
              type: "image",
              data: `data:${contentType};base64,${base64}`,
              mimeType: contentType
            },
            {
              type: "text",
              text: JSON.stringify({
                miroImageId: image.id,
                dimensions: {
                  width: image.geometry?.width,
                  height: image.geometry?.height
                }
              }, null, 2)
            }
          ],
        };
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error(`Failed to get image: ${error.message}`);
        }
        throw new Error('Failed to get image: Unknown error');
      }
    }

    default:
      throw new Error(`Unknown image tool: ${toolName}`);
  }
}; 
import { MiroClient } from '../MiroClient.js';

/**
 * Tool definitions for screenshot/export capabilities
 */
export const screenshotToolDefinitions = [
  {
    name: 'export_board_as_json',
    description: 'Export the board data in JSON format. Note: Miro does not provide a direct screenshot API. For visual exports, use get_frame_spatial_map from spatial tools which provides SVG visualization with coordinate system.',
    inputSchema: {
      type: 'object',
      properties: {
        boardId: {
          type: 'string',
          description: 'ID of the board to export',
        },
        includeImages: {
          type: 'boolean',
          description: 'Whether to include high-resolution image URLs',
          default: true,
        },
      },
      required: ['boardId'],
    }
  }
];

/**
 * Handler for screenshot/export tools
 */
export const handleScreenshotTools = async (
  toolName: string,
  args: any,
  miroClient: MiroClient
) => {
  if (toolName === 'export_board_as_json') {
    const { boardId, includeImages = true } = args;
    
    try {
      // Get all board items
      const boardItems = await miroClient.getAllItems(boardId);
      
      // If includeImages is true, enhance image URLs to high-resolution
      if (includeImages) {
        boardItems.forEach((item: any) => {
          if (item.type === 'image' && item.data?.imageUrl) {
            // Add the original format parameter for high-resolution images
            item.highResImageUrl = `${item.data.imageUrl}?format=original`;
          }
        });
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `Exported ${boardItems.length} items from board ${boardId}. Note: For visual exports, use get_frame_spatial_map tool.`
          },
          {
            type: 'json',
            data: boardItems
          }
        ]
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to export board data: ${error.message}`);
      }
      throw new Error('Failed to export board data: Unknown error');
    }
  }
  
  throw new Error(`Unknown screenshot tool: ${toolName}`);
}; 
import { MiroClient, MiroItem } from '../MiroClient.js';

/**
 * Tool definitions for shape and drawing data extraction
 */
export const shapeToolDefinitions = [
  {
    name: 'get_shape_details',
    description: 'Get detailed information about a shape including coordinates and style',
    input_schema: {
      type: 'object',
      properties: {
        boardId: {
          type: 'string',
          description: 'ID of the board containing the shape',
        },
        shapeId: {
          type: 'string',
          description: 'ID of the shape to get details for',
        },
      },
      required: ['boardId', 'shapeId'],
    },
    output_schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the shape',
        },
        type: {
          type: 'string',
          description: 'Type of the shape',
        },
        shape: {
          type: 'string',
          description: 'Shape type (e.g., circle, rectangle, etc.)',
        },
        x: {
          type: 'number',
          description: 'X coordinate of the shape',
        },
        y: {
          type: 'number',
          description: 'Y coordinate of the shape',
        },
        width: {
          type: 'number',
          description: 'Width of the shape',
        },
        height: {
          type: 'number',
          description: 'Height of the shape',
        },
        style: {
          type: 'object',
          description: 'Style information for the shape',
        },
        content: {
          type: 'string',
          description: 'Text content of the shape',
        }
      },
    },
  },
  {
    name: 'get_shapes_by_type',
    description: 'Get all shapes of a specific type on a board',
    input_schema: {
      type: 'object',
      properties: {
        boardId: {
          type: 'string',
          description: 'ID of the board to search in',
        },
        shapeType: {
          type: 'string',
          description: 'Type of shape to look for (e.g., circle, rectangle, etc.)',
        },
      },
      required: ['boardId', 'shapeType'],
    },
    output_schema: {
      type: 'object',
      properties: {
        shapes: {
          type: 'array',
          description: 'Array of shapes matching the requested type',
          items: {
            type: 'object',
          },
        },
      },
    },
  },
];

/**
 * Handler for shape tools
 */
export const handleShapeTools = async (
  toolName: string,
  args: any,
  miroClient: MiroClient
) => {
  if (toolName === 'get_shape_details') {
    const { boardId, shapeId } = args;
    
    try {
      // Get the shape data from the Miro API
      const shapeData = await miroClient.getItem(boardId, shapeId);
      
      // Validate that we have a shape item
      if (shapeData.type !== 'shape') {
        throw new Error(`Item with ID ${shapeId} is not a shape, it's a ${shapeData.type}`);
      }
      
      // Extract and return the relevant shape data
      return {
        id: shapeData.id,
        type: shapeData.type,
        shape: shapeData.shape,
        x: shapeData.position?.x,
        y: shapeData.position?.y,
        width: shapeData.geometry?.width,
        height: shapeData.geometry?.height,
        style: shapeData.style,
        content: shapeData.content
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to get shape details: ${error.message}`);
      }
      throw new Error('Failed to get shape details: Unknown error');
    }
  }
  
  if (toolName === 'get_shapes_by_type') {
    const { boardId, shapeType } = args;
    
    try {
      // Get all items from the board
      const allItems = await miroClient.getAllItems(boardId);
      
      // Filter to find shapes of the requested type
      const matchingShapes = allItems.filter((item: MiroItem) => 
        item.type === 'shape' && item.shape === shapeType
      );
      
      return {
        shapes: matchingShapes.map((shape: MiroItem) => ({
          id: shape.id,
          type: shape.type,
          shape: shape.shape,
          x: shape.position?.x,
          y: shape.position?.y,
          width: shape.geometry?.width,
          height: shape.geometry?.height,
          style: shape.style,
          content: shape.content
        }))
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to get shapes by type: ${error.message}`);
      }
      throw new Error('Failed to get shapes by type: Unknown error');
    }
  }
  
  throw new Error(`Unknown shape tool: ${toolName}`);
}; 
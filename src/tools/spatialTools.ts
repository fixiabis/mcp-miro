import { MiroClient, MiroItem } from '../MiroClient.js';

/**
 * Tool definitions for spatial awareness and SVG representation
 */
export const spatialToolDefinitions = [
  {
    name: 'get_frame_spatial_map',
    description: 'Get an SVG representation of a frame with coordinate system for spatial awareness. This tool provides detailed visualization of frame contents including shapes, images, and text with precise coordinates. Can be used for visual exports, spatial analysis, and understanding object placement.',
    inputSchema: {
      type: 'object',
      properties: {
        boardId: {
          type: 'string',
          description: 'ID of the board containing the frame',
        },
        frameId: {
          type: 'string',
          description: 'ID of the frame to analyze',
        },
        includeText: {
          type: 'boolean',
          description: 'Whether to include text content in the SVG representation',
          default: false,
        },
        gridDensity: {
          type: 'integer',
          description: 'Number of coordinate markers along each axis',
          default: 10,
          minimum: 4,
          maximum: 20,
        }
      },
      required: ['boardId', 'frameId'],
    }
  }
];

/**
 * Converts a Miro item to an SVG element
 */
function itemToSvgElement(item: MiroItem, includeText: boolean = false): string {
  const x = item.position?.x || 0;
  const y = item.position?.y || 0;
  const width = item.geometry?.width || 100;
  const height = item.geometry?.height || 100;
  const fillColor = item.style?.fillColor || '#ffffff';
  const borderColor = item.style?.borderColor || '#000000';
  const borderWidth = item.style?.borderWidth || 1;
  
  let svgElement = '';
  const textContent = includeText && item.content ? 
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="12">${item.content}</text>` : '';
  
  switch (item.type) {
    case 'shape':
      // Basic representation as a rectangle for all shapes
      svgElement = `<rect x="${x - width/2}" y="${y - height/2}" width="${width}" height="${height}" 
                    fill="${fillColor}" stroke="${borderColor}" stroke-width="${borderWidth}"/>`;
      break;
    case 'sticky_note':
      svgElement = `<rect x="${x - width/2}" y="${y - height/2}" width="${width}" height="${height}" 
                    fill="${fillColor}" stroke="${borderColor}" stroke-width="${borderWidth}" rx="5" ry="5"/>`;
      break;
    case 'text':
      svgElement = `<rect x="${x - width/2}" y="${y - height/2}" width="${width}" height="${height}" 
                    fill="none" stroke="#cccccc" stroke-width="1" stroke-dasharray="5,5"/>`;
      break;
    case 'image':
      svgElement = `<rect x="${x - width/2}" y="${y - height/2}" width="${width}" height="${height}" 
                    fill="#eef" stroke="${borderColor}" stroke-width="${borderWidth}"/>
                    <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="12">[IMAGE]</text>`;
      break;
    case 'frame':
      svgElement = `<rect x="${x - width/2}" y="${y - height/2}" width="${width}" height="${height}" 
                    fill="none" stroke="#0066ff" stroke-width="2" stroke-dasharray="10,5"/>
                    <text x="${x}" y="${y - height/2 + 20}" text-anchor="middle" font-size="14" fill="#0066ff">[FRAME]</text>`;
      break;
    default:
      svgElement = `<rect x="${x - width/2}" y="${y - height/2}" width="${width}" height="${height}" 
                    fill="none" stroke="#999999" stroke-width="1" stroke-dasharray="3,3"/>`;
  }
  
  return `<g>${svgElement}${textContent}</g>`;
}

/**
 * Creates coordinate grid markers for the SVG
 */
function createCoordinateGrid(frame: MiroItem, density: number): string {
  const x = frame.position?.x || 0;
  const y = frame.position?.y || 0;
  const width = frame.geometry?.width || 1000;
  const height = frame.geometry?.height || 1000;
  
  const left = x - width/2;
  const top = y - height/2;
  const right = x + width/2;
  const bottom = y + height/2;
  
  let grid = '<g class="coordinate-grid">';
  
  // X-axis markers
  for (let i = 0; i <= density; i++) {
    const xPos = left + (width * i / density);
    const xCoord = Math.round(xPos);
    grid += `<line x1="${xPos}" y1="${top}" x2="${xPos}" y2="${top + 10}" stroke="#999" stroke-width="1"/>`;
    grid += `<text x="${xPos}" y="${top - 5}" text-anchor="middle" font-size="10">${xCoord}</text>`;
  }
  
  // Y-axis markers
  for (let i = 0; i <= density; i++) {
    const yPos = top + (height * i / density);
    const yCoord = Math.round(yPos);
    grid += `<line x1="${left}" y1="${yPos}" x2="${left + 10}" y2="${yPos}" stroke="#999" stroke-width="1"/>`;
    grid += `<text x="${left - 5}" y="${yPos}" text-anchor="end" dominant-baseline="middle" font-size="10">${yCoord}</text>`;
  }
  
  // Add borders with coordinate ticks
  grid += `<rect x="${left}" y="${top}" width="${width}" height="${height}" fill="none" stroke="#666" stroke-width="1"/>`;
  
  grid += '</g>';
  return grid;
}

/**
 * Handler for spatial tools
 */
export const handleSpatialTools = async (
  toolName: string,
  args: any,
  miroClient: MiroClient
) => {
  if (toolName === 'get_frame_spatial_map') {
    const { boardId, frameId, includeText = false, gridDensity = 10 } = args;
    
    try {
      // Get the frame data
      const frame = await miroClient.getItem(boardId, frameId);
      
      if (frame.type !== 'frame') {
        throw new Error(`Item with ID ${frameId} is not a frame, it's a ${frame.type}`);
      }
      
      // Get all items in the frame
      const items = await miroClient.getItemsInFrame(boardId, frameId);
      
      // Create SVG representation
      const frameWidth = frame.geometry?.width || 1000;
      const frameHeight = frame.geometry?.height || 1000;
      const frameX = frame.position?.x || 0;
      const frameY = frame.position?.y || 0;
      
      const svgItems = items.map(item => itemToSvgElement(item, includeText)).join('\n');
      const coordinateGrid = createCoordinateGrid(frame, gridDensity);
      
      // Create the complete SVG
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${frameWidth}" height="${frameHeight}" 
     viewBox="${frameX - frameWidth/2} ${frameY - frameHeight/2} ${frameWidth} ${frameHeight}"
     xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: Arial, sans-serif; }
    .coordinate-grid text { fill: #666; }
  </style>
  <!-- Coordinate grid -->
  ${coordinateGrid}
  <!-- Frame background -->
  <rect x="${frameX - frameWidth/2}" y="${frameY - frameHeight/2}" width="${frameWidth}" height="${frameHeight}" 
        fill="#ffffff" opacity="0.1"/>
  <!-- Items -->
  ${svgItems}
</svg>`;
      
      return {
        content: [
          {
            type: "text",
            text: `Spatial map for frame "${frame.title || frameId}" with ${items.length} items and coordinate system`
          },
          {
            type: "svg",
            data: svg
          },
          {
            type: "json",
            data: {
              frameId: frameId,
              frameTitle: frame.title,
              frameBounds: {
                x: frameX,
                y: frameY,
                width: frameWidth,
                height: frameHeight,
                left: frameX - frameWidth/2,
                top: frameY - frameHeight/2,
                right: frameX + frameWidth/2,
                bottom: frameY + frameHeight/2
              },
              itemCount: items.length
            }
          }
        ]
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate spatial map: ${error.message}`);
      }
      throw new Error('Failed to generate spatial map: Unknown error');
    }
  }
  
  throw new Error(`Unknown spatial tool: ${toolName}`);
}; 
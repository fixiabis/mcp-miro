import { MiroClient, MiroItem } from '../MiroClient.js';
import { createCanvas, loadImage } from 'canvas';

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

// Extend the base type with connector fields
interface ExtendedMiroItem extends MiroItem {
  start?: { item: string; position?: { x: number; y: number }; snapTo?: string };
  end?: { item: string; position?: { x: number; y: number }; snapTo?: string };
}

/**
 * Converts a Miro item to an SVG element
 */
function itemToSvgElement(item: ExtendedMiroItem, includeText: boolean = false): string {
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
function createCoordinateGrid(frame: ExtendedMiroItem, density: number): string {
  const x = frame.position?.x || 0;
  const y = frame.position?.y || 0;
  const width = frame.geometry?.width || 1000;
  const height = frame.geometry?.height || 1000;
  
  const left = x - width/2;
  const top = y - height/2;
  const right = x + width/2;
  const bottom = y + height/2;
  
  let grid = '<g class="coordinate-grid">';
  
  // Main axes lines
  grid += `<line x1="${left}" y1="${top - 50}" x2="${right}" y2="${top - 50}" stroke="#000" stroke-width="2"/>`;  // X-axis
  grid += `<line x1="${left - 50}" y1="${top}" x2="${left - 50}" y2="${bottom}" stroke="#000" stroke-width="2"/>`; // Y-axis
  
  // X-axis markers with more prominent ticks
  for (let i = 0; i <= density; i++) {
    const xPos = left + (width * i / density);
    const xCoord = Math.round(xPos);
    // Prominent tick marks
    grid += `<line x1="${xPos}" y1="${top - 60}" x2="${xPos}" y2="${top - 40}" stroke="#000" stroke-width="3"/>`;
    // Coordinate numbers with larger font
    grid += `<text x="${xPos}" y="${top - 70}" text-anchor="middle" font-size="16" font-weight="bold">${xCoord}</text>`;
  }
  
  // Y-axis markers with more prominent ticks
  for (let i = 0; i <= density; i++) {
    const yPos = top + (height * i / density);
    const yCoord = Math.round(yPos);
    // Prominent tick marks
    grid += `<line x1="${left - 60}" y1="${yPos}" x2="${left - 40}" y2="${yPos}" stroke="#000" stroke-width="3"/>`;
    // Coordinate numbers with larger font
    grid += `<text x="${left - 65}" y="${yPos + 5}" text-anchor="end" font-size="16" font-weight="bold">${yCoord}</text>`;
  }
  
  // Frame outline
  grid += `<rect x="${left}" y="${top}" width="${width}" height="${height}" 
           fill="none" stroke="#000" stroke-width="2" stroke-dasharray="5,5"/>`;
  
  grid += '</g>';
  return grid;
}

interface GeometricData {
  frame: {
    id: string;
    type: string;
    position: {
      global: {
        x: number;
        y: number;
      };
    };
    bounds: {
      global: {
        left: number;
        top: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
      };
    };
  };
  items: Array<{
    id: string;
    type: string;
    position: {
      global: { x: number; y: number };
      relative: { x: number; y: number };
    };
    bounds: {
      global: {
        left: number;
        top: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
      };
      relative: {
        left: number;
        top: number;
        right: number;
        bottom: number;
        width: number;
        height: number;
      };
    };
    style: Record<string, any>;
    content?: string;
  }>;
}

/**
 * Handler for spatial tools
 */
export const handleSpatialTools = async (
  toolName: string,
  args: any,
  miroClient: MiroClient
): Promise<{ content: Array<{ type: string; text?: string; data?: string; mimeType?: string }> }> => {
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
      
      // Calculate frame bounds first
      const frameBoardX = frame.position?.x || 0;
      const frameBoardY = frame.position?.y || 0;
      const frameWidth = frame.geometry?.width || 0;
      const frameHeight = frame.geometry?.height || 0;
      
      // Create geometric data structure with both board-relative and frame-relative coordinates
      const geometricData = {
        frame: {
          id: frameId,
          type: 'frame',
          position: {
            board: {  // Position relative to board center (0,0)
              x: frameBoardX,
              y: frameBoardY
            }
          },
          bounds: {
            width: frameWidth,
            height: frameHeight,
            board: {
              left: frameBoardX - frameWidth/2,
              top: frameBoardY - frameHeight/2,
              right: frameBoardX + frameWidth/2,
              bottom: frameBoardY + frameHeight/2
            }
          }
        },
        items: items.map(item => {
          // Item's position is in board coordinates (relative to 0,0)
          const boardX = item.position?.x || 0;
          const boardY = item.position?.y || 0;
          
          // Calculate frame's top-left corner in board coordinates
          const frameTopLeftX = frameBoardX - frameWidth/2;
          const frameTopLeftY = frameBoardY - frameHeight/2;
          
          // Calculate position relative to frame's top-left corner
          const frameRelativeX = boardX - frameTopLeftX;
          const frameRelativeY = boardY - frameTopLeftY;
          
          // Debug coordinate calculation
          console.log(`Item ${item.id} coordinate calculation:`, {
            itemBoardPos: { x: boardX, y: boardY },
            frameBoardPos: { x: frameBoardX, y: frameBoardY },
            frameTopLeft: { x: frameTopLeftX, y: frameTopLeftY },
            frameRelative: { x: frameRelativeX, y: frameRelativeY }
          });
          
          return {
            id: item.id,
            type: item.type,
            position: {
              board: {  // Position relative to board center (0,0)
                x: boardX,
                y: boardY
              },
              frame: {  // Position relative to frame's top-left corner
                x: frameRelativeX,
                y: frameRelativeY
              }
            },
            dimensions: {
              width: item.geometry?.width || 0,
              height: item.geometry?.height || 0
            },
            style: item.style || {},
            content: includeText ? item.content : undefined
          };
        })
      };

      // Set up canvas with padding
      const padding = 50;
      const canvasWidth = frameWidth + (padding * 2);
      const canvasHeight = frameHeight + (padding * 2);
      
      // Create canvas and get context
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');
      
      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw grid lines
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      const gridStep = 100; // 100 board units = 100 pixels at 100% zoom
      
      // Calculate grid line positions
      const startX = Math.floor(padding / gridStep) * gridStep;
      const startY = Math.floor(padding / gridStep) * gridStep;
      const endX = Math.ceil((canvasWidth - padding) / gridStep) * gridStep;
      const endY = Math.ceil((canvasHeight - padding) / gridStep) * gridStep;
      
      // Vertical grid lines
      for (let x = startX; x <= endX; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvasHeight - padding);
        ctx.stroke();
        
        // Add coordinate label with larger font
        const frameX = x - padding;
        ctx.fillStyle = '#666666';
        ctx.font = '14px Arial';  // Increased from 10px
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(frameX).toString(), x, canvasHeight - padding + 20);  // Adjusted position
      }
      
      // Horizontal grid lines
      for (let y = startY; y <= endY; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvasWidth - padding, y);
        ctx.stroke();
        
        // Add coordinate label with larger font
        const frameY = y - padding;
        ctx.fillStyle = '#666666';
        ctx.font = '14px Arial';  // Increased from 10px
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(frameY).toString(), padding - 8, y + 5);  // Adjusted position
      }
      
      // Draw frame outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(padding, padding, frameWidth, frameHeight);
      ctx.setLineDash([]);
      
      // Draw items with more visible colors
      items.forEach(item => {
        // Use board coordinates directly since they're already frame-relative
        const canvasX = padding + (item.position?.x || 0);
        const canvasY = padding + (item.position?.y || 0);
        const itemWidth = Math.max(item.geometry?.width || 0, 50); // Minimum width of 50 for visibility
        const itemHeight = Math.max(item.geometry?.height || 0, 30); // Minimum height of 30 for visibility

        // Debug item position
        console.log(`Drawing item ${item.id}:`, {
          type: item.type,
          position: { x: item.position?.x, y: item.position?.y },
          canvasPos: { x: canvasX, y: canvasY },
          dimensions: { width: itemWidth, height: itemHeight }
        });

        switch (item.type) {
          case 'sticky_note':
            // Draw sticky note with yellow color
            ctx.fillStyle = '#ffeb3b';
            ctx.globalAlpha = 0.8;
            ctx.fillRect(
              canvasX - itemWidth/2,
              canvasY - itemHeight/2,
              itemWidth,
              itemHeight
            );
            break;

          case 'text':
            // Draw text bounding box with dashed border
            ctx.strokeStyle = '#666666';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(
              canvasX - itemWidth/2,
              canvasY - itemHeight/2,
              itemWidth,
              itemHeight
            );
            ctx.setLineDash([]);
            break;

          case 'connector':
          case 'line':
            // Draw connector/arrow with simplified style
            // Miro connector geometry has start.position and end.position
            const connGeometry = item.geometry as { 
              start: { position: { x: number; y: number } }; 
              end: { position: { x: number; y: number } }; 
            };

            if (connGeometry?.start?.position && connGeometry?.end?.position) {
              // Get start and end points in frame coordinates
              const startX = padding + (connGeometry.start.position.x || 0);
              const startY = padding + (connGeometry.start.position.y || 0);
              const endX = padding + (connGeometry.end.position.x || 0);
              const endY = padding + (connGeometry.end.position.y || 0);

              // Debug connector position
              console.log(`Drawing connector ${item.id}:`, {
                start: connGeometry.start.position,
                end: connGeometry.end.position,
                canvasStart: { x: startX, y: startY },
                canvasEnd: { x: endX, y: endY }
              });

              // Draw line
              ctx.strokeStyle = '#2196f3';
              ctx.lineWidth = 2;
              ctx.setLineDash([]); // Reset any previous dash settings
              ctx.beginPath();
              ctx.moveTo(startX, startY);
              ctx.lineTo(endX, endY);
              ctx.stroke();

              // Draw arrow head
              const angle = Math.atan2(endY - startY, endX - startX);
              const arrowLength = 15;
              const arrowWidth = Math.PI / 6;

              ctx.beginPath();
              ctx.moveTo(endX, endY);
              ctx.lineTo(
                endX - arrowLength * Math.cos(angle - arrowWidth),
                endY - arrowLength * Math.sin(angle - arrowWidth)
              );
              ctx.moveTo(endX, endY);
              ctx.lineTo(
                endX - arrowLength * Math.cos(angle + arrowWidth),
                endY - arrowLength * Math.sin(angle + arrowWidth)
              );
              ctx.stroke();

              // Add small dots at endpoints for debugging
              ctx.fillStyle = '#ff0000';
              ctx.beginPath();
              ctx.arc(startX, startY, 3, 0, Math.PI * 2);
              ctx.arc(endX, endY, 3, 0, Math.PI * 2);
              ctx.fill();
            }
            break;

          case 'shape':
            // Draw shape with light blue color
            ctx.fillStyle = '#2196f3';
            ctx.globalAlpha = 0.6;
            ctx.fillRect(
              canvasX - itemWidth/2,
              canvasY - itemHeight/2,
              itemWidth,
              itemHeight
            );
            break;

          default:
            // Draw other items with gray
            ctx.fillStyle = '#e0e0e0';
            ctx.globalAlpha = 0.6;
            ctx.fillRect(
              canvasX - itemWidth/2,
              canvasY - itemHeight/2,
              itemWidth,
              itemHeight
            );
        }
        
        // Draw border for all items except connectors
        if (!['connector', 'line'].includes(item.type)) {
          ctx.globalAlpha = 1.0;
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            canvasX - itemWidth/2,
            canvasY - itemHeight/2,
            itemWidth,
            itemHeight
          );

          // Add item ID and type label
          ctx.font = 'bold 12px Arial';
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.globalAlpha = 1.0;
          const shortId = item.id.substring(item.id.length - 4); // Show last 4 chars of ID
          ctx.fillText(
            `${item.type} (${shortId})`, 
            canvasX, 
            canvasY
          );
        }

        // Handle connectors between items
        if (item.type === 'connector' && item.start?.item && item.end?.item) {
          // Find start and end items
          const startItem = items.find(i => i.id === item.start?.item);
          const endItem = items.find(i => i.id === item.end?.item);

          if (startItem?.position && endItem?.position) {
            // Calculate start and end points based on item positions
            const startX = padding + startItem.position.x;
            const startY = padding + startItem.position.y;
            const endX = padding + endItem.position.x;
            const endY = padding + endItem.position.y;

            // Draw connector line
            ctx.strokeStyle = '#2196f3';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Add arrow if needed (you can check connector style)
            const angle = Math.atan2(endY - startY, endX - startX);
            const arrowLength = 10;
            const arrowWidth = Math.PI / 6;

            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
              endX - arrowLength * Math.cos(angle - arrowWidth),
              endY - arrowLength * Math.sin(angle - arrowWidth)
            );
            ctx.moveTo(endX, endY);
            ctx.lineTo(
              endX - arrowLength * Math.cos(angle + arrowWidth),
              endY - arrowLength * Math.sin(angle + arrowWidth)
            );
            ctx.stroke();
          }
        }
      });
      
      // Get PNG data as base64
      const pngBuffer = canvas.toBuffer('image/png');
      const pngBase64 = pngBuffer.toString('base64');

      // Return simplified geometric data and image
      const simplifiedData = {
        frame: {
          id: frameId,
          dimensions: {
            width: frameWidth,
            height: frameHeight
          }
        },
        items: items.map(item => ({
          id: item.id,
          type: item.type,
          position: {
            x: item.position?.x || 0,
            y: item.position?.y || 0
          },
          dimensions: {
            width: item.geometry?.width || 0,
            height: item.geometry?.height || 0
          }
        }))
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(simplifiedData, null, 2)
          },
          {
            type: "image",
            data: pngBase64,
            mimeType: "image/png"
          }
        ]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: "text",
            text: `Failed to generate spatial map: ${errorMessage}`
          }
        ]
      };
    }
  }
  
  throw new Error(`Unknown spatial tool: ${toolName}`);
}; 
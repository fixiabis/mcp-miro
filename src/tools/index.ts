import { MiroClient } from "../MiroClient.js";
import { imageToolDefinitions, handleImageTools } from "./imageTools.js";
import { embedToolDefinitions, handleEmbedTools } from "./embedTools.js";
import { screenshotToolDefinitions, handleScreenshotTools } from "./screenshotTools.js";
import { shapeToolDefinitions, handleShapeTools } from "./shapeTools.js";
import { spatialToolDefinitions, handleSpatialTools } from "./spatialTools.js";
import { boardToolDefinitions, handleBoardTools } from "./boardTools.js";
import { contentToolDefinitions, handleContentTools } from "./contentTools.js";

/**
 * Get all tool definitions from the various tools modules
 */
export function getAllToolDefinitions() {
  return [
    ...boardToolDefinitions,
    ...contentToolDefinitions,
    ...imageToolDefinitions,
    ...embedToolDefinitions,
    ...screenshotToolDefinitions,
    ...shapeToolDefinitions,
    ...spatialToolDefinitions
  ];
}

/**
 * Handle a tool request based on the tool name
 * @param toolName Name of the tool to handle
 * @param args Arguments for the tool
 * @param miroClient Miro client instance
 * @returns Result of the tool operation
 */
export async function handleToolRequest(toolName: string, args: any, miroClient: MiroClient) {
  // Board tools
  if (toolName === 'list_boards' || 
      toolName === 'get_frames' ||
      toolName === 'get_items_in_frame') {
    return handleBoardTools(toolName, args, miroClient);
  }
  
  // Content creation tools
  if (toolName === 'create_sticky_note' || 
      toolName === 'bulk_create_items') {
    return handleContentTools(toolName, args, miroClient);
  }
  
  // Image tools
  if (toolName === 'create_image' || toolName === 'get_image') {
    return handleImageTools(toolName, args, miroClient);
  }
  
  // Embed tools
  if (toolName.startsWith('create_embed')) {
    return handleEmbedTools(toolName, args, miroClient);
  }
  
  // Screenshot tools
  if (toolName === 'export_board_as_json') {
    return handleScreenshotTools(toolName, args, miroClient);
  }
  
  // Shape tools
  if (toolName === 'get_shape_details' || toolName === 'get_shapes_by_type') {
    return handleShapeTools(toolName, args, miroClient);
  }
  
  // Spatial tools
  if (toolName === 'get_frame_spatial_map') {
    return handleSpatialTools(toolName, args, miroClient);
  }
  
  throw new Error(`Unknown tool: ${toolName}`);
} 
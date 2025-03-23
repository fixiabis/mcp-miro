import { MiroClient } from "../MiroClient.js";
import { imageToolDefinitions, handleImageTools } from "./imageTools.js";
import { embedToolDefinitions, handleEmbedTools } from "./embedTools.js";
import { screenshotToolDefinitions, handleScreenshotTools } from "./screenshotTools.js";
import { shapeToolDefinitions, handleShapeTools } from "./shapeTools.js";
import { spatialToolDefinitions, handleSpatialTools } from "./spatialTools.js";

/**
 * Get all tool definitions from the various tools modules
 */
export function getAllToolDefinitions() {
  return [
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
  if (toolName === 'create_image' || toolName === 'get_image') {
    return handleImageTools(toolName, args, miroClient);
  }
  
  if (toolName.startsWith('create_embed')) {
    return handleEmbedTools(toolName, args, miroClient);
  }
  
  if (toolName === 'export_board_as_json') {
    return handleScreenshotTools(toolName, args, miroClient);
  }
  
  if (toolName === 'get_shape_details' || toolName === 'get_shapes_by_type') {
    return handleShapeTools(toolName, args, miroClient);
  }
  
  if (toolName === 'get_frame_spatial_map') {
    return handleSpatialTools(toolName, args, miroClient);
  }
  
  throw new Error(`Unknown tool: ${toolName}`);
} 
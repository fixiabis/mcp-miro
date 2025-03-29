import { MiroClient } from "../MiroClient.js";
import { imageToolDefinitions, handleImageTools } from "./imageTools.js";
import { embedToolDefinitions, handleEmbedTools } from "./embedTools.js";
import { shapeToolDefinitions, handleShapeTools } from "./shapeTools.js";
import { spatialToolDefinitions, handleSpatialTools } from "./spatialTools.js";
import { boardToolDefinitions, handleBoardTools } from "./boardTools.js";
import { contentToolDefinitions, handleContentTools } from "./contentTools.js";

// Export all tool definitions and handlers
export {
  imageToolDefinitions, handleImageTools,
  embedToolDefinitions, handleEmbedTools,
  shapeToolDefinitions, handleShapeTools,
  spatialToolDefinitions, handleSpatialTools,
  boardToolDefinitions, handleBoardTools,
  contentToolDefinitions, handleContentTools
};

/**
 * Get all tool definitions from the various tools modules
 */
export function getAllToolDefinitions() {
  return [
    ...boardToolDefinitions,
    ...contentToolDefinitions,
    ...imageToolDefinitions,
    ...embedToolDefinitions,
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
  if (boardToolDefinitions.some(tool => tool.name === toolName)) {
    return handleBoardTools(toolName, args, miroClient);
  }
  
  // Content creation tools
  if (contentToolDefinitions.some(tool => tool.name === toolName)) {
    return handleContentTools(toolName, args, miroClient);
  }
  
  // Image tools
  if (imageToolDefinitions.some(tool => tool.name === toolName)) {
    return handleImageTools(toolName, args, miroClient);
  }
  
  // Embed tools
  if (embedToolDefinitions.some(tool => tool.name === toolName)) {
    return handleEmbedTools(toolName, args, miroClient);
  }
  
  // Shape tools
  if (shapeToolDefinitions.some(tool => tool.name === toolName)) {
    return handleShapeTools(toolName, args, miroClient);
  }
  
  // Spatial tools
  if (spatialToolDefinitions.some(tool => tool.name === toolName)) {
    return handleSpatialTools(toolName, args, miroClient);
  }
  
  throw new Error(`Unknown tool: ${toolName}`);
}

export * from './imageTools.js';
export * from './embedTools.js';
export * from './shapeTools.js';
export * from './spatialTools.js'; 
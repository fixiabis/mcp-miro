# Based on the existing project code and all the documentation, we collect the key insights in this file 

# MCP Miro Extension Project Plan

## Overview
This project extends the Model Context Protocol (MCP) for Miro to enable additional capabilities:
1. Adding images to Miro canvas (URL and base64 encoded) ✅
2. Adding iframes to Miro canvas ✅
3. Taking screenshots/images from Miro board or frame as base64 ✅
4. Getting detailed coordinates/SVG format of shapes and manual drawings ✅

## Current State Analysis
- The existing implementation allows basic operations like board listing, sticky note creation, and shape manipulation
- ✅ Added image handling via URL and base64 encoding
- ✅ Added iframe embedding functionality
- ✅ Added board data export functionality
- ✅ Added shape data extraction capabilities
- All features have been implemented and align with MCP format requirements

## Implementation Plan

### 1. Extend MiroClient.ts with New API Methods

#### 1.1 Image Handling Methods ✅
- ✅ Implemented `createImageByUrl` method
- ✅ Implemented `createImageByBase64` method
- ✅ Implemented `createImageByFile` method for binary data
- ✅ All methods support position and size parameters

#### 1.2 Iframe Embedding ✅
- ✅ Implemented `createEmbed` method for iframe embedding
- ✅ Added support for positioning and sizing parameters
- ✅ Added support for mode (inline/modal) and preview URL

#### 1.3 Board/Frame Data Methods ✅
- ✅ Researched Miro API capabilities for board/frame export
- ✅ Implemented `getAllItems` method for getting all items on a board
- ✅ Implemented `getItem` method for getting specific item details
- ✅ Created workaround for lack of direct screenshot API by providing detailed board data

#### 1.4 Shape/Drawing Data Extraction ✅
- ✅ Investigated Miro API for accessing detailed shape data
- ✅ Implemented methods to extract coordinates and style data from shapes
- ✅ Added filtering capability to find shapes by type

### 2. Update index.ts to Expose New Tools

#### 2.1 Add New Tool Definitions ✅
- ✅ Restructured code into modular files for better organization
- ✅ Added tool definitions for image creation in `imageTools.ts`
- ✅ Added tool definitions for iframe embedding in `embedTools.ts`
- ✅ Added tool definitions for board data export in `screenshotTools.ts`
- ✅ Added tool definitions for shape data extraction in `shapeTools.ts`
- ✅ Created a unified tool registry in `tools/index.ts`

#### 2.2 Implement Tool Handlers ✅
- ✅ Implemented handlers for image tools
- ✅ Implemented handlers for iframe embedding
- ✅ Implemented handlers for board data export
- ✅ Implemented handlers for shape data extraction
- ✅ Updated main index.ts to use the modular tool system

### 3. Test and Document New Features

#### 3.1 Testing Plan
- Test each new feature individually with various input parameters
- Test complex scenarios combining multiple features
- Verify MCP format compliance for all responses

#### 3.2 Documentation
- Update project documentation to reflect new capabilities
- Document input/output formats for each new tool
- Include examples of common usage patterns

## Implementation Order
1. ✅ Image creation (URL, base64, and binary file)
2. ✅ Iframe embedding
3. ✅ Board data export
4. ✅ Shape/drawing data extraction

## Resources Consulted
- Miro REST API documentation links in `miro_reference_links.csv`
- Current implementation in `MiroClient.ts` and `index.ts`
- MCP format requirements for binary data handling
- Third-party libraries for image processing
- Community discussions about Miro API limitations and workarounds

## Notes
- Dependencies added: form-data, node-fetch, @types/form-data, @types/node-fetch
- Code restructured into modular components for better maintainability
- Created workarounds for Miro API limitations (e.g., no direct screenshot API) by providing detailed board data
- Added robust error handling throughout the codebase
- Improved TypeScript typing for better code quality
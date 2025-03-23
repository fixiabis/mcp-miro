# Miro Extension for Model Context Protocol (MCP)

## Overview

This extension enables AI agents to interact with Miro boards through the Model Context Protocol (MCP). It provides advanced capabilities for manipulating and extracting data from Miro boards, making it a powerful tool for AI-assisted design, collaboration, and data visualization.

## Features

### Image Tools
- Create images on Miro boards using URLs
- Upload images using base64-encoded data
- Support for positioning and sizing

### Iframe Embedding
- Embed iframes into Miro boards (websites, videos, etc.)
- Control display mode (inline/modal)
- Set preview images for embedded content

### Board Data Export
- Export entire board data in JSON format
- Get detailed information about board items
- View comprehensive board structure and content

### Shape Data Extraction
- Get detailed information about specific shapes
- Extract positions, dimensions, and styles
- Query shapes by type across a board

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

## Authentication

The extension requires a Miro OAuth token to function. You can provide this token when running the server:

```bash
npm start -- --miro-token YOUR_TOKEN_HERE
```

## Tools

### Image Tools

#### `create_image_from_url`
Create an image on a Miro board from a URL.

```json
{
  "boardId": "board_id_here",
  "imageUrl": "https://example.com/image.png",
  "x": 0,
  "y": 0,
  "width": 300,
  "height": 200
}
```

#### `create_image_from_base64`
Create an image on a Miro board from base64-encoded data.

```json
{
  "boardId": "board_id_here",
  "base64Data": "base64_string_here",
  "x": 0,
  "y": 0,
  "width": 300,
  "height": 200
}
```

### Iframe Embedding

#### `create_embed`
Embed an iframe on a Miro board.

```json
{
  "boardId": "board_id_here",
  "url": "https://example.com",
  "x": 0,
  "y": 0,
  "width": 600,
  "mode": "inline",
  "previewUrl": "https://example.com/preview.png"
}
```

### Board Data Export

#### `export_board_as_json`
Export all data from a Miro board in JSON format.

```json
{
  "boardId": "board_id_here"
}
```

#### `get_shape_data`
Get detailed data for a specific item on a board.

```json
{
  "boardId": "board_id_here",
  "itemId": "item_id_here"
}
```

### Shape Data Extraction

#### `get_shape_details`
Get detailed information about a specific shape.

```json
{
  "boardId": "board_id_here",
  "shapeId": "shape_id_here"
}
```

#### `get_shapes_by_type`
Get all shapes of a specific type on a board.

```json
{
  "boardId": "board_id_here",
  "shapeType": "circle"
}
```

## Architecture

The extension follows a modular design with the following components:

- `MiroClient.ts`: Core client for interacting with the Miro API
- Tool modules in the `src/tools` directory:
  - `imageTools.ts`: Image creation tools
  - `embedTools.ts`: Iframe embedding tools
  - `screenshotTools.ts`: Board data export tools
  - `shapeTools.ts`: Shape data extraction tools
- `index.ts`: Main entry point that handles MCP requests

## Development

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Submit a pull request

## License

[MIT License](LICENSE)

## Notes

- This extension works around some limitations of the Miro API (e.g., no direct screenshot API) by providing comprehensive data that can be used to recreate or visualize boards.
- All API calls include robust error handling and response validation.
- The codebase is fully typed with TypeScript for better development experience and code quality.

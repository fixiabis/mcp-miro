import fetch from 'node-fetch';
import FormData from 'form-data';

interface MiroBoard {
  id: string;
  name: string;
  description?: string;
}

interface MiroBoardsResponse {
  data: MiroBoard[];
  total: number;
  size: number;
  offset: number;
}

export interface MiroPosition {
  x: number;
  y: number;
  origin?: string;
}

export interface MiroGeometry {
  width?: number;
  height?: number;
}

export interface MiroItem {
  id: string;
  type: string;
  position: MiroPosition;
  geometry?: MiroGeometry;
  data?: any;
  [key: string]: any;
}

interface MiroItemsResponse {
  data: MiroItem[];
  cursor?: string;
}

export class MiroClient {
  private miroToken: string;
  private baseUrl = 'https://api.miro.com/v2';

  constructor(miroToken: string) {
    this.miroToken = miroToken;
  }

  private async fetchApi(path: string, options: { method?: string; body?: any } = {}) {
    const response = await fetch(`https://api.miro.com/v2${path}`, {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${this.miroToken}`,
        'Content-Type': 'application/json'
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async getBoards(): Promise<MiroBoard[]> {
    const response = await this.fetchApi('/boards') as MiroBoardsResponse;
    return response.data;
  }

  async getBoardItems(boardId: string): Promise<MiroItem[]> {
    const response = await this.fetchApi(`/boards/${boardId}/items?limit=50`) as MiroItemsResponse;
    return response.data;
  }

  async createStickyNote(
    boardId: string,
    content: string,
    position: MiroPosition = { x: 0, y: 0 }
  ): Promise<MiroItem> {
    return this.fetchApi(`/boards/${boardId}/sticky_notes`, {
      method: 'POST',
      body: {
        data: { content },
        position
      }
    }) as Promise<MiroItem>;
  }

  async bulkCreateItems(
    boardId: string,
    items: Array<{
      type: string;
      [key: string]: any;
    }>
  ): Promise<any> {
    return this.fetchApi(`/boards/${boardId}/bulk_create_item`, {
      method: 'POST',
      body: {
        items
      }
    }) as Promise<any>;
  }

  async getFrames(boardId: string): Promise<MiroItem[]> {
    const response = await this.fetchApi(`/boards/${boardId}/items?type=frame&limit=50`) as MiroItemsResponse;
    return response.data;
  }

  async getItemsInFrame(boardId: string, frameId: string): Promise<MiroItem[]> {
    const response = await this.fetchApi(`/boards/${boardId}/items?parent_item_id=${frameId}&limit=50`) as MiroItemsResponse;
    return response.data;
  }

  async createShape(boardId: string, data: any): Promise<MiroItem> {
    return this.fetchApi(`/boards/${boardId}/shapes`, {
      method: 'POST',
      body: data
    }) as Promise<MiroItem>;
  }

  /**
   * Creates an image on a board using a URL
   * @param boardId The ID of the board to create the image on
   * @param imageUrl The URL of the image to create
   * @param position Optional position information for the image
   * @param geometry Optional geometry information for the image
   * @returns The created image item
   */
  async createImageByUrl(
    boardId: string,
    imageUrl: string,
    position?: { x: number; y: number; origin?: string },
    geometry?: { width?: number; height?: number }
  ): Promise<MiroItem> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.miroToken}`
      },
      body: JSON.stringify({
        data: {
          url: imageUrl
        },
        position: position || undefined,
        geometry: geometry || undefined
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create image by URL: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json() as MiroItem;
  }

  /**
   * Creates an image on a board using base64 encoded data
   * @param boardId The ID of the board to create the image on
   * @param base64Data The base64 encoded image data
   * @param position Optional position information for the image
   * @param geometry Optional geometry information for the image
   * @returns The created image item
   */
  async createImageByBase64(
    boardId: string,
    base64Data: string,
    position?: { x: number; y: number; origin?: string },
    geometry?: { width?: number; height?: number }
  ): Promise<MiroItem> {
    try {
      // Make sure base64Data is properly formatted - strip header if present
      let imageData = base64Data;
      if (base64Data.includes(';base64,')) {
        imageData = base64Data.split(';base64,')[1];
      }
      
      // Create a buffer from the base64 data
      const buffer = Buffer.from(imageData, 'base64');
      
      // Use the buffer to create the image
      return this.createImageByFile(boardId, buffer, position, geometry);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to create image from base64: ${error.message}`);
      }
      throw new Error('Failed to create image from base64: Unknown error');
    }
  }

  /**
   * Creates an image on a board using a file
   * @param boardId The ID of the board to create the image on
   * @param file The image file to upload
   * @param position Optional position information for the image
   * @param geometry Optional geometry information for the image
   * @returns The created image item
   */
  async createImageByFile(
    boardId: string,
    file: Buffer,
    position?: { x: number; y: number; origin?: string },
    geometry?: { width?: number; height?: number }
  ): Promise<MiroItem> {
    try {
      const formData = new FormData();
      
      // Add position and geometry data as JSON
      const data: any = {};
      if (position) data.position = position;
      if (geometry) data.geometry = geometry;
      
      formData.append('data', JSON.stringify(data));
      
      // Add the image file as binary data
      formData.append('resource', file, {
        filename: 'image.png',
        contentType: 'image/png'
      });

      const response = await fetch(`${this.baseUrl}/boards/${boardId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.miroToken}`
        },
        body: formData as any
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create image from file: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json() as MiroItem;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to create image from file: ${error.message}`);
      }
      throw new Error('Failed to create image from file: Unknown error');
    }
  }

  /**
   * Creates an embed (iframe) on a Miro board
   * @param boardId The ID of the board to create the embed on
   * @param data The embed data
   * @param position Optional position information for the embed
   * @param geometry Optional geometry information for the embed
   * @returns The created embed item
   */
  async createEmbed(
    boardId: string,
    data: { url: string; mode?: string; previewUrl?: string },
    position?: MiroPosition,
    geometry?: MiroGeometry
  ): Promise<MiroItem> {
    const response = await this.fetchApi(`/boards/${boardId}/embeds`, {
      method: 'POST',
      body: {
        data,
        position,
        geometry
      }
    });
    return response as MiroItem;
  }

  /**
   * Get all items from a Miro board
   * @param boardId The ID of the board to get items from
   * @returns Array of all items on the board
   */
  async getAllItems(boardId: string): Promise<MiroItem[]> {
    // Start with an empty array to collect all items
    let allItems: MiroItem[] = [];
    let cursor: string | undefined;
    
    do {
      // Build the URL with cursor if available
      let url = `/boards/${boardId}/items?limit=50`;
      if (cursor) {
        url += `&cursor=${cursor}`;
      }
      
      // Fetch the next page of items
      const response = await this.fetchApi(url) as MiroItemsResponse;
      
      // Add the items to our collection
      allItems = [...allItems, ...response.data];
      
      // Update the cursor for the next page
      cursor = response.cursor;
      
      // Continue until there is no more cursor
    } while (cursor);
    
    return allItems;
  }

  /**
   * Get a specific item from a Miro board by ID
   * @param boardId The ID of the board containing the item
   * @param itemId The ID of the item to retrieve
   * @returns The requested item
   */
  async getItem(boardId: string, itemId: string): Promise<MiroItem> {
    return this.fetchApi(`/boards/${boardId}/items/${itemId}`) as Promise<MiroItem>;
  }
}
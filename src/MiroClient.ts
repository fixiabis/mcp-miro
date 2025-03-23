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
  ) {
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
  ) {
    return this.fetchApi(`/boards/${boardId}/bulk_create_item`, {
      method: 'POST',
      body: {
        items
      }
    }) as Promise<MiroItem>;
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
  ) {
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

    return await response.json();
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
  ) {
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
  ) {
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

      return await response.json();
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
   * @param url The URL to embed
   * @param position Optional position information for the embed
   * @param geometry Optional geometry information for the embed
   * @param mode Optional display mode for the embed ('inline' or 'modal')
   * @param previewUrl Optional URL for a preview image
   * @returns The created embed item
   */
  async createEmbed(
    boardId: string, 
    url: string,
    position?: { x: number; y: number; origin?: string },
    geometry?: { width?: number; height?: number },
    mode?: 'inline' | 'modal',
    previewUrl?: string
  ) {
    try {
      const embedData: any = {
        url
      };
      
      if (mode) embedData.mode = mode;
      if (previewUrl) embedData.previewUrl = previewUrl;
      
      const response = await fetch(`${this.baseUrl}/boards/${boardId}/embeds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.miroToken}`
        },
        body: JSON.stringify({
          data: embedData,
          position: position || undefined,
          geometry: geometry || undefined
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create embed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to create embed: ${error.message}`);
      }
      throw new Error('Failed to create embed: Unknown error');
    }
  }

  /**
   * Get all items from a Miro board
   * @param boardId The ID of the board to get items from
   * @returns Array of all items on the board
   */
  async getAllItems(boardId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/boards/${boardId}/items`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.miroToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get all items: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to get all items: ${error.message}`);
      }
      throw new Error('Failed to get all items: Unknown error');
    }
  }

  /**
   * Get a specific item from a Miro board by ID
   * @param boardId The ID of the board containing the item
   * @param itemId The ID of the item to retrieve
   * @returns The requested item
   */
  async getItem(boardId: string, itemId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/boards/${boardId}/items/${itemId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.miroToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get item: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to get item: ${error.message}`);
      }
      throw new Error('Failed to get item: Unknown error');
    }
  }
}
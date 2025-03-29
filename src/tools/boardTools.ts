import { MiroClient } from "../MiroClient.js";

/**
 * Tool definitions for board operations
 */
export const boardToolDefinitions = [
	{
		name: "list_boards",
		description: "List all available Miro boards and their IDs",
		inputSchema: {
			type: "object",
			properties: {},
		},
	},
	{
		name: "get_frames",
		description: "Get all frames from a Miro board",
		inputSchema: {
			type: "object",
			properties: {
				boardId: {
					type: "string",
					description: "ID of the board to get frames from",
				},
			},
			required: ["boardId"],
		},
	},
	{
		name: "get_items_in_frame",
		description: "Get all items contained within a specific frame on a Miro board",
		inputSchema: {
			type: "object",
			properties: {
				boardId: {
					type: "string",
					description: "ID of the board that contains the frame",
				},
				frameId: {
					type: "string",
					description: "ID of the frame to get items from",
				},
			},
			required: ["boardId", "frameId"],
		},
	},
	{
		name: "get_items_on_board",
		description:
			"Retrieves a list of items for a specific board. You can retrieve all items on the board, a list of child items inside a parent item, or a list of specific types of items by specifying URL query parameter values.",
		inputSchema: {
			type: "object",
			properties: {
				boardId: {
					type: "string",
					description: "ID of the board to get items from",
				},
				limit: {
					type: "string",
					description:
						"The maximum number of results to return per call. If the number of items in the response is greater than the limit specified, the response returns the cursor parameter with a value.",
					maximum: 50,
					minimum: 10,
					default: "10",
				},
				type: {
					type: "string",
					enum: ["text", "shape", "sticky_note", "image", "document", "card", "app_card", "preview", "frame", "embed"],
					description:
						"If you want to get a list of items of a specific type, specify an item type. For example, if you want to retrieve the list of card items, set `type` to `cards`.\n Possible values: `app_card`, `card`, `document`, `embed`, `frame`, `image`, `shape`, `sticky_note`, `text`",
				},
				cursor: {
					type: "string",
					description:
						"A cursor-paginated method returns a portion of the total set of results based on the limit specified and a `cursor` that points to the next portion of the results. To retrieve the next portion of the collection, set the `cursor` parameter equal to the `cursor` value you received in the response of the previous request.",
				},
			},
			required: ["boardId"],
		},
	},
];

/**
 * Handle board tool requests
 * @param toolName Name of the tool being called
 * @param args Arguments passed to the tool
 * @param miroClient Miro client instance
 * @returns Response formatted for MCP
 */
export async function handleBoardTools(toolName: string, args: any, miroClient: MiroClient) {
	switch (toolName) {
		case "list_boards": {
			const boards = await miroClient.getBoards();
			return {
				content: [
					{
						type: "text",
						text: "Here are the available Miro boards:",
					},
					...boards.map((b) => ({
						type: "text",
						text: `Board ID: ${b.id}, Name: ${b.name}`,
					})),
				],
			};
		}

		case "get_frames": {
			const { boardId } = args;
			const frames = await miroClient.getFrames(boardId);

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(frames, null, 2),
					},
				],
			};
		}

		case "get_items_in_frame": {
			const { boardId, frameId } = args;
			const items = await miroClient.getItemsInFrame(boardId, frameId);

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(items, null, 2),
					},
				],
			};
		}

		case "get_items_on_board": {
			const { boardId, limit, cursor, type } = args;
			const items = await miroClient.getItemsOnBoard(boardId, limit, cursor, type);

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(items, null, 2),
					},
				],
			};
		}

		default:
			throw new Error(`Unknown board tool: ${toolName}`);
	}
}

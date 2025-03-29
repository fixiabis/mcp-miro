import { MiroClient } from "../MiroClient.js";

/**
 * Tool definitions for content creation operations
 */
export const contentToolDefinitions = [
	{
		name: "create_sticky_note_item",
		description:
			"Create a sticky note on a Miro board. By default, sticky notes are 199x228 and available in these colors: gray, light_yellow, yellow, orange, light_green, green, dark_green, cyan, light_pink, pink, violet, red, light_blue, blue, dark_blue, black.",
		inputSchema: {
			type: "object",
			properties: {
				boardId: {
					type: "string",
					description: "ID of the board to create the sticky note on",
				},
				data: {
					type: "object",
					description: "Contains sticky note item data, such as the content or shape of the sticky note.",
					properties: {
						content: {
							type: "string",
							description: "The actual text (content) that appears in the sticky note item.",
							examples: ["Hello"],
						},
						shape: {
							type: "string",
							default: "square",
							description: "Defines the geometric shape of the sticky note and aspect ratio for its dimensions.",
							enum: ["square", "rectangle"],
						},
					},
				},
				style: {
					type: "object",
					description:
						"Contains information about the style of a sticky note item, such as the fill color or text alignment.",
					properties: {
						fillColor: {
							type: "string",
							description: "Fill color for the sticky note.\nDefault: `light_yellow`.",
							enum: [
								"gray",
								"light_yellow",
								"yellow",
								"orange",
								"light_green",
								"green",
								"dark_green",
								"cyan",
								"light_pink",
								"pink",
								"violet",
								"red",
								"light_blue",
								"blue",
								"dark_blue",
								"black",
							],
						},
						textAlign: {
							type: "string",
							description: "Defines how the sticky note text is horizontally aligned.\nDefault: `center`.",
							enum: ["left", "right", "center"],
						},
						textAlignVertical: {
							type: "string",
							description: "Defines how the sticky note text is vertically aligned.\nDefault: `top`.",
							enum: ["top", "middle", "bottom"],
						},
					},
				},
				position: {
					type: "object",
					description:
						"Contains location information about the item, such as its x coordinate, y coordinate, and the origin of the x and y coordinates.",
					properties: {
						x: {
							type: "number",
							format: "double",
							description:
								"X-axis coordinate of the location of the item on the board. By default, all items have absolute positioning to the board, not the current viewport. Default: 0. The center point of the board has `x: 0` and `y: 0` coordinates.",
							examples: [100],
						},
						y: {
							type: "number",
							format: "double",
							description:
								"Y-axis coordinate of the location of the item on the board. By default, all items have absolute positioning to the board, not the current viewport. Default: 0. The center point of the board has `x: 0` and `y: 0` coordinates.",
							examples: [100],
						},
					},
				},
				geometry: {
					type: "object",
					description:
						"Contains geometrical information about the item. You can set either the width or height. You cannot set both the width and height at the same time.",
					properties: {
						height: {
							type: "number",
							format: "double",
							description: "Height of the item, in pixels.",
							examples: [60],
						},
						width: {
							type: "number",
							format: "double",
							description: "Width of the item, in pixels.",
							examples: [320],
						},
					},
				},
				parent: {
					type: "object",
					description:
						"Contains information about the parent this item must be attached to. A maximum of 5000 items can be attached to a frame. Passing `null` for `parent.id` directly attaches an item to the canvas.",
					properties: {
						id: {
							type: "string",
							format: "int64",
							description: "Unique identifier (ID) of the parent for the item.",
							examples: ["3458764517517819001"],
						},
					},
				},
			},
			required: ["boardId", "data", "style", "position"],
		},
	},
	{
		name: "update_sticky_note_item",
		description: "Updates a sticky note item on a board based on the data and style properties.",
		inputSchema: {
			type: "object",
			properties: {
				boardId: {
					type: "string",
					description: "ID of the board to update the sticky note on",
				},
				itemId: {
					type: "string",
					description: "ID of the sticky note item to update",
				},
				data: {
					type: "object",
					description: "Contains sticky note item data, such as the content or shape of the sticky note.",
					properties: {
						content: {
							type: "string",
							description: "The actual text (content) that appears in the sticky note item.",
							examples: ["Hello"],
						},
						shape: {
							type: "string",
							default: "square",
							description: "Defines the geometric shape of the sticky note and aspect ratio for its dimensions.",
							enum: ["square", "rectangle"],
						},
					},
				},
				style: {
					type: "object",
					description:
						"Contains information about the style of a sticky note item, such as the fill color or text alignment.",
					properties: {
						fillColor: {
							type: "string",
							description: "Fill color for the sticky note.\nDefault: `light_yellow`.",
							enum: [
								"gray",
								"light_yellow",
								"yellow",
								"orange",
								"light_green",
								"green",
								"dark_green",
								"cyan",
								"light_pink",
								"pink",
								"violet",
								"red",
								"light_blue",
								"blue",
								"dark_blue",
								"black",
							],
						},
						textAlign: {
							type: "string",
							description: "Defines how the sticky note text is horizontally aligned.\nDefault: `center`.",
							enum: ["left", "right", "center"],
						},
						textAlignVertical: {
							type: "string",
							description: "Defines how the sticky note text is vertically aligned.\nDefault: `top`.",
							enum: ["top", "middle", "bottom"],
						},
					},
				},
				position: {
					type: "object",
					description:
						"Contains location information about the item, such as its x coordinate, y coordinate, and the origin of the x and y coordinates.",
					properties: {
						x: {
							type: "number",
							format: "double",
							description:
								"X-axis coordinate of the location of the item on the board. By default, all items have absolute positioning to the board, not the current viewport. Default: 0. The center point of the board has `x: 0` and `y: 0` coordinates.",
							examples: [100],
						},
						y: {
							type: "number",
							format: "double",
							description:
								"Y-axis coordinate of the location of the item on the board. By default, all items have absolute positioning to the board, not the current viewport. Default: 0. The center point of the board has `x: 0` and `y: 0` coordinates.",
							examples: [100],
						},
					},
				},
				geometry: {
					type: "object",
					description:
						"Contains geometrical information about the item. You can set either the width or height. You cannot set both the width and height at the same time.",
					properties: {
						height: {
							type: "number",
							format: "double",
							description: "Height of the item, in pixels.",
							examples: [60],
						},
						width: {
							type: "number",
							format: "double",
							description: "Width of the item, in pixels.",
							examples: [320],
						},
					},
				},
				parent: {
					type: "object",
					description:
						"Contains information about the parent this item must be attached to. A maximum of 5000 items can be attached to a frame. Passing `null` for `parent.id` directly attaches an item to the canvas.",
					properties: {
						id: {
							type: "string",
							format: "int64",
							description: "Unique identifier (ID) of the parent for the item.",
							examples: ["3458764517517819001"],
						},
					},
				},
			},
			required: ["boardId", "itemId", "data", "style", "position"],
		},
	},
	{
		name: "delete_sticky_note_item",
		description: "Deletes a sticky note item from a Miro board.",
		inputSchema: {
			type: "object",
			properties: {
				boardId: {
					type: "string",
					description: "ID of the board to delete the item from",
				},
				itemId: {
					type: "string",
					description: "ID of the item to delete",
				},
			},
			required: ["boardId", "itemId"],
		},
	},
	{
		name: "create_items_in_bulk",
		description: "Create multiple items on a Miro board in a single transaction (max 20 items)",
		inputSchema: {
			type: "object",
			properties: {
				boardId: {
					type: "string",
					description: "ID of the board to create the items on",
				},
				items: {
					type: "array",
					items: {
						type: "object",
						description: "Creates one or more items in one request. You can create up to 20 items per request.",
						properties: {
							type: {
								type: "string",
								description: "Type of item that you want to create.",
								enum: ["app_card", "text", "shape", "sticky_note", "image", "document", "card", "frame", "embed"],
								examples: ["text"],
							},
							data: {
								type: "object",
								description: "Contains data information applicable for each item type.",
								oneOf: [
									{
										type: "object",
										description: "Contains app card item data, such as the title, description, or fields.",
										properties: {
											description: {
												type: "string",
												description: "A short text description to add context about the app card.",
												examples: ["Sample app card description"],
											},
											fields: {
												type: "array",
												description:
													"Array where each object represents a custom preview field. Preview fields are displayed on the bottom half of the app card in the compact view.",
												items: {
													type: "object",
													description:
														"Array where each object represents a custom preview field. Preview fields are displayed on the bottom half of the app card in the compact view.",
													properties: {
														fillColor: {
															type: "string",
															description:
																"Hex value representing the color that fills the background area of the preview field, when it's displayed on the app card.",
															examples: ["#2fa9e3"],
														},
														iconShape: {
															type: "string",
															default: "round",
															description: "The shape of the icon on the preview field.",
															enum: ["round", "square"],
														},
														iconUrl: {
															type: "string",
															description:
																"A valid URL pointing to an image available online.\nThe transport protocol must be HTTPS.\nPossible image file formats: JPG/JPEG, PNG, SVG.",
															examples: ["https://cdn-icons-png.flaticon.com/512/5695/5695864.png"],
														},
														textColor: {
															type: "string",
															description: "Hex value representing the color of the text string assigned to `value`.",
															examples: ["#1a1a1a"],
														},
														tooltip: {
															type: "string",
															description:
																"A short text displayed in a tooltip when clicking or hovering over the preview field.",
															examples: ["Completion status indicator"],
														},
														value: {
															type: "string",
															description:
																"The actual data value of the custom field.\nIt can be any type of information that you want to convey.",
															examples: ["Status: in progress"],
														},
													},
												},
											},
											status: {
												type: "string",
												default: "disconnected",
												description:
													"Status indicating whether an app card is connected and in sync with the source. When the source for the app card is deleted, the status returns `disabled`.",
												enum: ["disconnected", "connected", "disabled"],
											},
											title: {
												type: "string",
												default: "sample app card item",
												description: "A short text header to identify the app card.",
											},
										},
									},
									{
										type: "object",
										description: "Contains card item data, such as the title, description, due date, or assignee ID.",
										properties: {
											assigneeId: {
												type: "string",
												format: "int64",
												description:
													"Unique user identifier. In the GUI, the user ID is mapped to the name of the user who is assigned as the owner of the task or activity described in the card. The identifier is a string containing numbers, and it is automatically assigned to a user when they first sign up.",
												examples: ["3074457362577955300"],
											},
											description: {
												type: "string",
												description: "A short text description to add context about the card.",
												examples: ["sample card description"],
											},
											dueDate: {
												type: "string",
												format: "date-time",
												description:
													"The date when the task or activity described in the card is due to be completed. In the GUI, users can select the due date from a calendar. Format: UTC, adheres to [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601), includes a [trailing Z offset](https://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)).",
												examples: ["2023-10-12T22:00:55.000Z"],
											},
											title: {
												type: "string",
												default: "sample card item",
												description: "A short text header for the card.",
												examples: ["sample card item"],
											},
										},
									},
									{
										type: "object",
										description: "Contains information about the document URL.",
										properties: {
											title: {
												type: "string",
												description: "A short text header to identify the document.",
												examples: ["Sample document title"],
											},
											url: {
												type: "string",
												default: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
												description: "URL where the document is hosted.",
												examples: ["https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"],
											},
										},
										required: ["url"],
									},
									{
										type: "object",
										description: "Contains information about the embed URL.",
										properties: {
											mode: {
												type: "string",
												description:
													"Defines how the content in the embed item is displayed on the board.\n`inline`: The embedded content is displayed directly on the board.\n`modal`: The embedded content is displayed inside a modal overlay on the board.",
												enum: ["inline", "modal"],
											},
											previewUrl: {
												type: "string",
												description: "URL of the image to be used as the preview image for the embedded item.",
											},
											url: {
												type: "string",
												default: "https://www.youtube.com/watch?v=HlVSNEiFCBk",
												description:
													"A [valid URL](https://developers.miro.com/reference/data#embeddata) pointing to the content resource that you want to embed in the board. Possible transport protocols: HTTP, HTTPS.",
											},
										},
										required: ["url"],
									},
									{
										type: "object",
										description: "Contains information about the image URL.",
										properties: {
											title: {
												type: "string",
												description: "A short text header to identify the image.",
												examples: ["Sample image title"],
											},
											url: {
												type: "string",
												default:
													"https://miro.com/static/images/page/mr-index/localization/en/slider/ideation_brainstorming.png",
												description: "URL of the image.",
												examples: [
													"https://miro.com/static/images/page/mr-index/localization/en/slider/ideation_brainstorming.png",
												],
											},
										},
										required: ["url"],
									},
									{
										type: "object",
										description: "Contains shape item data, such as the content or shape type of the shape.",
										properties: {
											content: {
												type: "string",
												description: "The text you want to display on the shape.",
												examples: ["Hello"],
											},
											shape: {
												type: "string",
												default: "rectangle",
												description: "Defines the geometric shape of the item when it is rendered on the board.",
												enum: [
													"rectangle",
													"round_rectangle",
													"circle",
													"triangle",
													"rhombus",
													"parallelogram",
													"trapezoid",
													"pentagon",
													"hexagon",
													"octagon",
													"wedge_round_rectangle_callout",
													"star",
													"flow_chart_predefined_process",
													"cloud",
													"cross",
													"can",
													"right_arrow",
													"left_arrow",
													"left_right_arrow",
													"left_brace",
													"right_brace",
												],
											},
										},
									},
									{
										type: "object",
										description: "Contains sticky note item data, such as the content or shape of the sticky note.",
										properties: {
											content: {
												type: "string",
												description: "The actual text (content) that appears in the sticky note item.",
												examples: ["Hello"],
											},
											shape: {
												type: "string",
												default: "square",
												description:
													"Defines the geometric shape of the sticky note and aspect ratio for its dimensions.",
												enum: ["square", "rectangle"],
											},
										},
									},
									{
										type: "object",
										description:
											"Contains text item data, such as the title, content, or description. For more information on the JSON properties, see [Data](https://developers.miro.com/reference/data).",
										properties: {
											content: {
												type: "string",
												description: "The actual text (content) that appears in the text item.",
												examples: ["Hello"],
											},
										},
										required: ["content"],
									},
									{
										type: "object",
										description: "Contains frame item data, such as the title, frame type, or frame format.",
										properties: {
											format: {
												type: "string",
												default: "custom",
												description: "Only custom frames are supported at the moment.",
												enum: ["custom"],
											},
											title: {
												type: "string",
												default: "Sample frame title",
												description: "Title of the frame. This title appears at the top of the frame.",
											},
											type: {
												type: "string",
												default: "freeform",
												description: "Only free form frames are supported at the moment.",
												enum: ["freeform"],
											},
											showContent: {
												type: "boolean",
												default: true,
												description: "Hide or reveal the content inside a frame (Enterprise plan only).",
											},
										},
									},
								],
							},
							style: {
								type: "object",
								description: "Contains information about item-specific styles.",
								oneOf: [
									{
										type: "object",
										description: "Contains information about the style of an app card item, such as the fill color.",
										properties: {
											fillColor: {
												type: "string",
												description: "Hex value of the border color of the app card.\nDefault: `#2d9bf0`.",
												examples: ["#2d9bf0"],
											},
										},
									},
									{
										type: "object",
										description: "Contains information about the style of a card item, such as the card theme.",
										properties: {
											cardTheme: {
												type: "string",
												description: "Hex value of the border color of the card.\nDefault: `#2d9bf0`.",
												examples: ["#2d9bf0"],
											},
										},
									},
									{
										type: "object",
										description: "Contains information about the shape style, such as the border color or opacity.",
										properties: {
											borderColor: {
												type: "string",
												description: "Defines the color of the border of the shape.\nDefault: `#1a1a1a` (dark gray).",
											},
											borderOpacity: {
												type: "string",
												description:
													"Defines the opacity level of the shape border.\nPossible values: any number between `0.0` and `1.0`, where:\n`0.0`: the background color is completely transparent or invisible\n`1.0`: the background color is completely opaque or solid\nDefault: `1.0` (solid color).",
												maximum: 1,
												minimum: 0,
											},
											borderStyle: {
												type: "string",
												description: "Defines the style used to represent the border of the shape.\nDefault: `normal`.",
												enum: ["normal", "dotted", "dashed"],
											},
											borderWidth: {
												type: "string",
												description: "Defines the thickness of the shape border, in dp.\nDefault: `2.0`.",
												maximum: 24,
												minimum: 1,
											},
											color: {
												type: "string",
												description:
													"Hex value representing the color for the text within the shape item.\nDefault: `#1a1a1a`.",
												examples: ["#1a1a1a"],
											},
											fillColor: {
												type: "string",
												description:
													"Fill color for the shape.\nHex values: `#f5f6f8` `#d5f692` `#d0e17a` `#93d275` `#67c6c0` `#23bfe7` `#a6ccf5` `#7b92ff` `#fff9b1` `#f5d128` `#ff9d48` `#f16c7f` `#ea94bb` `#ffcee0` `#b384bb` `#000000`\nDefault: #ffffff.",
												examples: ["#8fd14f"],
											},
											fillOpacity: {
												type: "string",
												description:
													"Opacity level of the fill color.\nPossible values: any number between `0` and `1`, where:\n`0.0`: the background color is completely transparent or invisible.\n`1.0`: the background color is completely opaque or solid.\n\n Default: `1.0` if `fillColor` is provided, `0.0` if `fillColor` is not provided.\n",
												maximum: 1,
												minimum: 0,
											},
											fontFamily: {
												type: "string",
												description: "Defines the font type for the text in the shape item.\nDefault: `arial`.",
												enum: [
													"arial",
													"abril_fatface",
													"bangers",
													"eb_garamond",
													"georgia",
													"graduate",
													"gravitas_one",
													"fredoka_one",
													"nixie_one",
													"open_sans",
													"permanent_marker",
													"pt_sans",
													"pt_sans_narrow",
													"pt_serif",
													"rammetto_one",
													"roboto",
													"roboto_condensed",
													"roboto_slab",
													"caveat",
													"times_new_roman",
													"titan_one",
													"lemon_tuesday",
													"roboto_mono",
													"noto_sans",
													"plex_sans",
													"plex_serif",
													"plex_mono",
													"spoof",
													"tiempos_text",
													"formular",
												],
											},
											fontSize: {
												type: "string",
												description: "Defines the font size, in dp, for the text on the shape.\nDefault: `14`.",
												maximum: 288,
												minimum: 10,
											},
											textAlign: {
												type: "string",
												description: "Defines how the sticky note text is horizontally aligned.\nDefault: `center`.",
												enum: ["left", "right", "center"],
											},
											textAlignVertical: {
												type: "string",
												description: "Defines how the sticky note text is vertically aligned.\nDefault: `top`.",
												enum: ["top", "middle", "bottom"],
											},
										},
									},
									{
										type: "object",
										description:
											"Contains information about the style of a sticky note item, such as the fill color or text alignment.",
										properties: {
											fillColor: {
												type: "string",
												description: "Fill color for the sticky note.\nDefault: `light_yellow`.",
												enum: [
													"gray",
													"light_yellow",
													"yellow",
													"orange",
													"light_green",
													"green",
													"dark_green",
													"cyan",
													"light_pink",
													"pink",
													"violet",
													"red",
													"light_blue",
													"blue",
													"dark_blue",
													"black",
												],
											},
											textAlign: {
												type: "string",
												description: "Defines how the sticky note text is horizontally aligned.\nDefault: `center`.",
												enum: ["left", "right", "center"],
											},
											textAlignVertical: {
												type: "string",
												description: "Defines how the sticky note text is vertically aligned.\nDefault: `top`.",
												enum: ["top", "middle", "bottom"],
											},
										},
									},
									{
										type: "object",
										description:
											"Contains information about the style of a text item, such as the fill color or font family.",
										properties: {
											color: {
												type: "string",
												description:
													"Hex value representing the color for the text within the text item.\nDefault: `#1a1a1a`.",
												examples: ["#1a1a1a"],
											},
											fillColor: {
												type: "string",
												description: "Background color of the text item.\nDefault: `#ffffff`.",
												examples: ["#e6e6e6"],
											},
											fillOpacity: {
												type: "string",
												description:
													"Opacity level of the background color.\nPossible values: any number between `0.0` and `1.0`, where:\n`0.0`: the background color is completely transparent or invisible.\n`1.0`: the background color is completely opaque or solid.\nDefault: `1.0` if `fillColor` is provided, `0.0` if `fillColor` is not provided.",
												maximum: 1,
												minimum: 0,
											},
											fontFamily: {
												type: "string",
												description: "Font type for the text in the text item.\nDefault: `arial`.",
												enum: [
													"arial",
													"abril_fatface",
													"bangers",
													"eb_garamond",
													"georgia",
													"graduate",
													"gravitas_one",
													"fredoka_one",
													"nixie_one",
													"open_sans",
													"permanent_marker",
													"pt_sans",
													"pt_sans_narrow",
													"pt_serif",
													"rammetto_one",
													"roboto",
													"roboto_condensed",
													"roboto_slab",
													"caveat",
													"times_new_roman",
													"titan_one",
													"lemon_tuesday",
													"roboto_mono",
													"noto_sans",
													"plex_sans",
													"plex_serif",
													"plex_mono",
													"spoof",
													"tiempos_text",
													"formular",
												],
											},
											fontSize: {
												type: "string",
												description: "Font size, in dp.\nDefault: `14`.",
												minimum: 1,
											},
											textAlign: {
												type: "string",
												description: "Horizontal alignment for the item's content.\nDefault: `center.`",
												enum: ["left", "right", "center"],
											},
										},
									},
								],
							},
							position: {
								type: "object",
								description:
									"Contains location information about the item, such as its x coordinate, y coordinate, and the origin of the x and y coordinates.",
								properties: {
									x: {
										type: "number",
										format: "double",
										description:
											"X-axis coordinate of the location of the item on the board. By default, all items have absolute positioning to the board, not the current viewport. Default: 0. The center point of the board has `x: 0` and `y: 0` coordinates.",
										examples: [100],
									},
									y: {
										type: "number",
										format: "double",
										description:
											"Y-axis coordinate of the location of the item on the board. By default, all items have absolute positioning to the board, not the current viewport. Default: 0. The center point of the board has `x: 0` and `y: 0` coordinates.",
										examples: [100],
									},
								},
							},
							geometry: {
								type: "object",
								description: "Contains geometrical information about the item, such as its width or height.",
								properties: {
									height: {
										type: "number",
										format: "double",
										description: "Height of the item, in pixels.",
										examples: [60],
									},
									rotation: {
										type: "number",
										format: "double",
										description:
											"Rotation angle of an item, in degrees, relative to the board. You can rotate items clockwise (right) and counterclockwise (left) by specifying positive and negative values, respectively.",
									},
									width: {
										type: "number",
										format: "double",
										description: "Width of the item, in pixels.",
										examples: [320],
									},
								},
							},
							parent: {
								type: "object",
								description:
									"Contains information about the parent this item must be attached to. A maximum of 5000 items can be attached to a frame. Passing `null` for `parent.id` directly attaches an item to the canvas.",
								properties: {
									id: {
										type: "string",
										format: "int64",
										description: "Unique identifier (ID) of the parent for the item.",
										examples: ["3458764517517819001"],
									},
								},
							},
						},
						required: ["type"],
					},
					minItems: 1,
					maxItems: 20,
					$schema: "http://json-schema.org/draft-04/schema#",
				},
			},
			required: ["boardId", "items"],
		},
	},
];

/**
 * Handle content creation tool requests
 * @param toolName Name of the tool being called幫我在 board uXjVITLkoRg= 新增一個方形藍色的便利貼，寫著 TEST
 * @param args Arguments passed to the tool
 * @param miroClient Miro client instance
 * @returns Response formatted for MCP
 */
export async function handleContentTools(toolName: string, args: any, miroClient: MiroClient) {
	switch (toolName) {
		case "create_sticky_note_item": {
			const { boardId, data, style, position, geometry, parent } = args;

			const stickyNote = await miroClient.createStickyNote(boardId, data, style, position, geometry, parent);

			return {
				content: [
					{
						type: "text",
						text: `Created sticky note ${stickyNote.id} on board ${boardId}`,
					},
				],
			};
		}

		case "update_sticky_note_item": {
			const { boardId, itemId, data, style, position, geometry, parent } = args;

			const updatedItem = await miroClient.updateStickyNote(boardId, itemId, data, style, position, geometry, parent);

			return {
				content: [
					{
						type: "text",
						text: `Updated sticky note item ${itemId} on board ${boardId}`,
					},
				],
			};
		}

		case "delete_sticky_note_item": {
			const { boardId, itemId } = args;

			await miroClient.deleteStickyNote(boardId, itemId);

			return {
				content: [
					{
						type: "text",
						text: `Deleted sticky note item ${itemId} on board ${boardId}`,
					},
				],
			};
		}

		case "create_items_in_bulk": {
			const { boardId, items } = args;

			const payload = await miroClient.bulkCreateItems(boardId, items);

			return {
				content: [
					{
						type: "text",
						text: `Created ${payload.data.length} items on board ${boardId}`,
					},
				],
			};
		}

		default:
			throw new Error(`Unknown content tool: ${toolName}`);
	}
}

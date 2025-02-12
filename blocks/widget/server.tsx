import { smoothStream, streamText } from "ai";
import { myProvider } from "@/lib/ai/models";
import { createDocumentHandler } from "@/lib/blocks/server";
import { updateDocumentPrompt } from "@/lib/ai/prompts";

export const widgetDocumentHandler = createDocumentHandler<"widget">({
	kind: "widget",
	// Called when the document is first created.
	onCreateDocument: async ({ title, dataStream }) => {
		let draftContent = "";
		// For demonstration, use streamText to generate content.
		const { fullStream } = streamText({
			model: myProvider.languageModel("block-model"),
			system:
				"Generate a creative piece based on the title. Markdown is supported.",
			experimental_transform: smoothStream({ chunking: "word" }),
			prompt: title,
		});

		// Stream the content back to the client.
		for await (const delta of fullStream) {
			if (delta.type === "text-delta") {
				draftContent += delta.textDelta;
				dataStream.writeData({
					type: "content-update",
					content: delta.textDelta,
				});
			}
		}

		return draftContent;
	},
	// Called when updating the document based on user modifications.
	onUpdateDocument: async ({ document, description, dataStream }) => {
		let draftContent = "";
		const { fullStream } = streamText({
			model: myProvider.languageModel("block-model"),
			system: updateDocumentPrompt(document.content, "widget"),
			experimental_transform: smoothStream({ chunking: "word" }),
			prompt: description,
			experimental_providerMetadata: {
				openai: {
					prediction: {
						type: "content",
						content: document.content,
					},
				},
			},
		});

		for await (const delta of fullStream) {
			if (delta.type === "text-delta") {
				draftContent += delta.textDelta;
				dataStream.writeData({
					type: "content-update",
					content: delta.textDelta,
				});
			}
		}

		return draftContent;
	},
});
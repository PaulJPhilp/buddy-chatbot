import { cx } from "class-variance-authority";
import { DisplayDocument } from "../document/display-document";
import { DocumentToolResult, DocumentToolCall } from "../document/document-tool";
import { ExtendableWeather } from "../tools/weather/weather";

export const ToolResult = ({
	toolName,
	result,
	isReadonly,
}: {
	toolName: string;
	result: any; // Tool results are dynamically typed based on the tool
	isReadonly: boolean;
}) => {
	console.log('ToolResult', toolName, '\n', JSON.stringify(result, null, 2));
	switch (toolName) {

		case 'getWeather':
			console.log('ToolResult.getWeather', JSON.stringify(result, null, 2));
			return <ExtendableWeather weatherAtLocation={result} />;
		case 'createDocument':
			console.log('ToolResult.createDocument', JSON.stringify(result, null, 2));
			if (!result?.id) {
				console.warn('Document ID not yet available:', result);
				return null;
			}
			return (
				<DisplayDocument
					isReadonly={isReadonly}
					result={result}
				/>
			);
		case 'updateDocument':
			console.log('ToolResult.updateDocument', JSON.stringify(result, null, 2));
			return (
				<DocumentToolResult
					type="update"
					result={result}
					isReadonly={isReadonly}
				/>
			);
		case 'listAllDocuments':
			console.log('ToolInProgress.listAllDocuments');
			return null;
		case 'requestSuggestions':
			console.log('ToolResult.requestSuggestions');
			return (
				<DocumentToolResult
					type="request-suggestions"
					result={result}
					isReadonly={isReadonly}
				/>
			);
		case 'getKnowledgeBaseEntry':
			console.log('ToolResult.getKnowledgeBaseEntry');
			return null
		case 'addKnowledgeBaseEntry':
			console.log('ToolResult.addKnowledgeBaseEntry');
			return null;
		case 'listAllKnowledgeBaseEntries':
			console.log('ToolResult.listAllKnowledgeBaseEntries');
			return null;
		default:
			console.log('ToolResult.default', JSON.stringify(result, null, 2));
			return <pre>{JSON.stringify(result, null, 2)}</pre>;
	}
};

export const ToolInProgress = ({
	toolName,
	args,
	isReadonly,
}: {
	toolName: string;
	args: any;
	isReadonly: boolean;
}) => {

	switch (toolName) {
		case 'getWeather':
			return (
				<ExtendableWeather />
			);
		case 'createDocument':
			console.log('ToolInProgress.createDocument - args:', JSON.stringify(args, null, 2));
			return null;	
		case 'updateDocument':
			console.log('ToolInProgress.updateDocument - args:', JSON.stringify(args, null, 2));
			return null;
		case 'requestSuggestions':
			console.log('ToolInProgress.requestSuggestions - args:', JSON.stringify(args, null, 2));
			return (
				<DocumentToolCall
					type="request-suggestions"
					args={args}
					isReadonly={isReadonly}
				/>
			);
		case 'listAllDocuments':
			console.log('ToolInProgress.listAllDocuments');
			return null;
		case 'addKnowledgeBaseEntry':
			console.log('ToolInProgress.addKnowledgeBaseEntry');
			return null;
		case 'listAllKnowledgeBaseEntries':
			console.log('ToolInProgress.listAllKnowledgeBaseEntries');
			return null;
		default:
			return null;
	}
};

export const ToolInvocations = ({
	toolInvocations,
	isReadonly,
}: {
	toolInvocations?: Array<{
		toolName: string;
		toolCallId: string;
		state: string;
		args: any;
		result?: any;
	}>;
	isReadonly: boolean;
}) => {
	if (!toolInvocations?.length) return null;

	return (
		<div className="flex flex-col gap-4">
			{toolInvocations.map((toolInvocation) => {
				const { toolName, toolCallId, state, args, result } = toolInvocation;
				void console.log(`toolInvocation: ${toolName}  ${state}`);

				if (state === 'result') {
					return (
						<div key={toolCallId}>
							<ToolResult
								toolName={toolName}
								result={result}
								isReadonly={isReadonly}
							/>
							<div className="text-xs text-muted-foreground mt-1">
								Results for {toolName}
							</div>
						</div>
					);
				}

				return (
					<div
						key={toolCallId}
						className={cx({
							skeleton: ['getWeather'].includes(toolName),
						})}
					>
						<ToolInProgress
							toolName={toolName}
							args={args}
							isReadonly={isReadonly}
						/>

						<div className="text-xs text-muted-foreground mt-1">
							Running {toolName}
						</div>
					</div>
				);
			})}
		</div>
	);
};
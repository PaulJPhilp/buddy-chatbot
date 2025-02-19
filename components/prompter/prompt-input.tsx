import { Textarea } from '@/components/ui/textarea';
import type { Message } from 'ai';
import type { Dispatch, SetStateAction } from 'react';
import { SendButton } from '@/components/app/send-button';
import { StopButton } from './stop-button';
import type { Attachment } from 'ai';
import { findRelevantContent } from '@/lib/db/queries';

interface PromptInputProps {
	input: string;
	textAreaRef: React.RefObject<HTMLTextAreaElement>;
	setInput: (prevValue: string) => void;
	isLoading: boolean;
	submitFormAction: (input: string) => void;
	stopAction: () => void;
	setMessages: Dispatch<SetStateAction<Message[]>>;
	attachments: Attachment[];
	className?: string;
}

export const PromptInput = ({
	input,
	setInput,
	isLoading,
	submitFormAction,
	stopAction,
	setMessages,
	attachments,
	className,
	textAreaRef,
}: PromptInputProps) => {
	const handleEnhanceInput = async (input: string) => {
		console.log('Handling enhance input:', input);
		try {
			const relevantContent = await findRelevantContent(input);
			console.log('Relevant content:', relevantContent);

			if (!relevantContent) {
				submitFormAction(input);
				return;
			}

			// Use the most relevant document's content to enhance the input
			const enhancedInput = relevantContent.title 
				? `Based on ${relevantContent.title}: ${input}`
				: input;

			submitFormAction(enhancedInput);
		} catch (error) {
			console.error('Error enhancing input:', error);
			submitFormAction(input); // Fallback to original input if enhancement fails
		}
	};

	const handleSubmit = async () => {
		submitFormAction(input);
		//await handleEnhanceInput(input);
	};

	return (
		<>
			<Textarea
				ref={textAreaRef}
				tabIndex={0}
				rows={1}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Send a message"
				spellCheck={false}
				className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
				onKeyDown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						handleSubmit();
					}
				}}
			/>

			<div className="absolute right-0 top-4 sm:right-4">
				{isLoading ? (
					<StopButton stop={stopAction} setMessages={setMessages} />
				) : (
					<SendButton
						submitForm={handleSubmit}
						input={input}
						uploadQueue={[]}
					/>
				)}
			</div>
		</>
	);
};
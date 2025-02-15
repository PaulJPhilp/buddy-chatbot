import type { Dispatch, SetStateAction } from 'react';
import { Textarea } from '@/components/ui/textarea';
import type { Message, Attachment } from 'ai';
import { cx } from 'class-variance-authority';
import { SendButton } from '@/components/app/send-button';
import { StopButton } from './stop-button';
import type { DocumentAttachment } from '@/lib/types';

interface PromptInputProps {
	input: string;
	textAreaRef: React.RefObject<HTMLTextAreaElement>;
	setInput: (prevValue: string) => void;
	isLoading: boolean;
	submitFormAction: () => void;
	stopAction: () => void;
	setMessages: Dispatch<SetStateAction<Message[]>>;
	attachments: Attachment[];
	documents: DocumentAttachment[];
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
	documents,
	className,
	textAreaRef,
}: PromptInputProps) => {
	return (
		<>
			<Textarea
				ref={textAreaRef}
				tabIndex={0}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				placeholder="Send a message..."
				spellCheck={false}
				className={cx(
					'min-h-[88px] w-full resize-none rounded-lg pr-12 text-base py-3 dark:bg-zinc-800/90 dark:hover:bg-zinc-800',
					className,
				)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						submitFormAction();
					}
				}}
			/>
			<div className="absolute bottom-4 right-4">
				{isLoading ? (
					<StopButton 
						stop={stopAction}
						setMessages={setMessages}
					/>
				) : (
					<SendButton
						submitForm={submitFormAction}
						input={input}
						uploadQueue={[]}
					/>
				)}
			</div>
		</>
	);
};
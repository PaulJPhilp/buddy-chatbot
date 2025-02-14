import type { Dispatch, SetStateAction } from 'react';
import { Textarea } from './ui/textarea';
import type { Message, Attachment } from 'ai';
import { cx } from 'class-variance-authority';
import { SendButton } from './send-button';
import { StopButton } from './stop-button';

interface PromptInputProps {
	input: string;
	textAreaRef: React.RefObject<HTMLTextAreaElement>;
	setInput: (prevValue: string) => void;
	isLoading: boolean;
	submitFormAction: () => void;
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
			<div className="absolute right-2 bottom-[10px]">
				{isLoading ? (
					<StopButton stop={stopAction} setMessages={setMessages} />
				) : (
					<SendButton
						submitForm={submitFormAction}
						input={input}
						uploadQueue={attachments.map((a) => a.name ?? '')}
					/>
				)}
			</div>
		</>
	)
}
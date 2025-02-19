import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';

export const MessageContent = ({
	content,
	role,
}: {
	content?: string;
	role: string;
}) => {
	if (!content) return null;

	return (
		<div
			className={cn('flex flex-col gap-4', {
				'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
					role === 'user',
			})}
		>
			<Markdown>{content}</Markdown>
		</div>
	);
};
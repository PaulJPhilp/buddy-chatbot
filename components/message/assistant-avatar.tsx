import { SparklesIcon } from "../ui/icons";

export const AssistantAvatar = ({ role }: { role: string }) => {
	if (role !== 'assistant') return null;

	return (
		<div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
			<div className="translate-y-px">
				{<SparklesIcon size={14} />}
			</div>
		</div>
	);
};
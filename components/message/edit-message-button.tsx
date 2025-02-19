import type { MessageMode } from "@/lib/types";
import { Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { Button } from "../ui/button";
import { PencilEditIcon } from "../ui/icons";

export const EditMessageButton = ({
	role,
	isReadonly,
	hasContent,
	mode,
	onEdit,
}: {
	role: string;
	isReadonly: boolean;
	hasContent: boolean;
	mode: MessageMode;
	onEdit: () => void;
}) => {
	if (!hasContent || mode !== 'view') return null;

	return (
		<div className="flex flex-row gap-2 items-start">
			{role === 'user' && !isReadonly && (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							className="px-2 h-fit rounded-full text-muted-foreground 
                  opacity-0 group-hover/message:opacity-100"
							onClick={onEdit}
						>
							<PencilEditIcon />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Edit message</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
};

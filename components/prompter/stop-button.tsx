import { type Dispatch, memo, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { StopIcon } from "@/components/ui/icons";
import type { Message } from "ai";
import { sanitizeUIMessages } from "@/lib/utils";

function PureStopButton({
	stop,
	setMessages,
}: {
	stop: () => void;
	setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
	return (
		<Button
			className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
			onClick={(event) => {
				event.preventDefault();
				stop();
				setMessages((messages) => sanitizeUIMessages(messages));
			}}
		>
			<StopIcon size={14} />
		</Button>
	);
}

export const StopButton = memo(PureStopButton);
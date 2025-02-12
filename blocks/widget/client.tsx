import { Block } from '@/components/create-block';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	CopyIcon,
	LogsIcon,
	MessageIcon
} from '@/components/icons';
import { toast } from 'sonner';

type WidgetProps = {
	content: string;
	saveContent: (content: string, isCurrentVersion: boolean) => void;
	status: string;
	isCurrentVersion: boolean;
	currentVersionIndex: number;
};

type Metadata = {
	info: string;
};

export const widgetBlock = new Block<'widget', Metadata>({
	kind: 'widget',
	description:
		'Useful for displaying UI wigets, like a list of documents.',
	initialize: async ({ setMetadata }) => {
		setMetadata({
			info: `Document initialized.`,
		});
	},
	// Handle streamed parts from the server (if your block supports streaming updates)
	onStreamPart: ({ streamPart, setMetadata, setBlock }) => {
		if (streamPart.type === "widget-update") {
			setMetadata((metadata) => ({
				...metadata,
				info: streamPart.content as string,
			}));
		}
		if (streamPart.type === "content-update") {
			setBlock((draftBlock) => ({
				...draftBlock,
				content: draftBlock.content + (streamPart.content as string),
				status: "streaming",
			}));
		}
	},

	content: ({ metadata, setMetadata, ...props }) => {
		console.log('widgetcontent', props);
		return (
			<>
				<div className="px-1">
					<Card>
						<CardHeader>
							<CardTitle>Card Title</CardTitle>
							<CardDescription>Card Description</CardDescription>
						</CardHeader>
						<CardContent>
							<p>Card Content</p>
						</CardContent>
						<CardFooter>
							<p>Card Footer</p>
						</CardFooter>
					</Card>
				</div>
			</>
		);
	},
	actions: [
		{
			icon: <CopyIcon size={18} />,
			description: 'Copy code to clipboard',
			onClick: ({ content }) => {
				navigator.clipboard.writeText(content);
				toast.success('Copied to clipboard!');
			},
		},
	],
	toolbar: [
		{
			icon: <MessageIcon />,
			description: 'Add comments',
			onClick: ({ appendMessage }) => {
				appendMessage({
					role: 'user',
					content: 'Add comments to the code snippet for understanding',
				});
			},
		},
		{
			icon: <LogsIcon />,
			description: 'Add logs',
			onClick: ({ appendMessage }) => {
				appendMessage({
					role: 'user',
					content: 'Add logs to the code snippet for debugging',
				});
			},
		},
	],
});

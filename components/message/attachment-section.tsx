import { PreviewAttachment } from "../prompter/preview-attachment";


export const AttachmentsSection = ({
	attachments,
}: {
	attachments?: Array<{ url: string }>;
}) => {
	if (!attachments?.length) return null;

	return (
		<div className="flex flex-row justify-end gap-2">
			{attachments.map((attachment) => (
				<div key={attachment.url}>
					{<PreviewAttachment
						key={attachment.url}
						attachment={attachment}
					/>}
				</div>
			))}
		</div>
	);
};
'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { DocumentPicker } from '@/components/ui/document-picker';
import type { DocumentAttachment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { FileIcon } from '@/components/ui/icons';
import { listAllDocuments } from '@/lib/db/queries';

interface DocumentsInputProps {
	documents: DocumentAttachment[];
	setDocumentsAction: Dispatch<SetStateAction<Array<DocumentAttachment>>>;
	setUploadQueueAction: Dispatch<SetStateAction<Array<string>>>;
	isLoading: boolean;
	className?: string;
}

function PureDocumentsInput({
	documents,
	setDocumentsAction,
	setUploadQueueAction,
	isLoading,
	className,
}: DocumentsInputProps) {
	const [open, setOpen] = useState(false);

	// Fetch documents from your database
	useEffect(() => {

		async function fetchDocuments() {
			try {
				const docs = await listAllDocuments();
				const uniqueDocs = Array.from(
					new Map(docs.map(doc => [doc.id, doc])).values()
				);
				setDocumentsAction(uniqueDocs);

			} catch (error) {
				console.error('Failed to fetch documents:', error);
			}
		}

		fetchDocuments();
	}, []);

	const handleDocumentSelected = (documentId: string) => {
		const selectedDoc = documents.find(doc => doc.id === documentId);
		if (selectedDoc) {
			setUploadQueueAction(prev => [...prev, selectedDoc.title]);
		}
		setOpen(false);
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
	};

	return (
		<div className={className}>
			<Button
				variant="ghost"
				size="icon"
				className="h-9 w-9"
				onClick={() => setOpen(!open)}
				disabled={isLoading}
				type="button"
			>
				<FileIcon size={16} />
			</Button>
			<DocumentPicker
				documents={documents}
				onDocumentSelected={handleDocumentSelected}
				open={open}
				onOpenChange={handleOpenChange}
			/>
		</div>
	);
}

export const DocumentsInput = PureDocumentsInput;

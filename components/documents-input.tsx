'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { DocumentPicker } from '@/components/ui/document-picker';
import type { DocumentAttachment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { FileIcon } from 'lucide-react';
import { listAllDocuments } from '@/lib/db/queries';

interface DocumentsInputProps {
	setDocumentsAction: Dispatch<SetStateAction<Array<DocumentAttachment>>>;
	setUploadQueueAction: Dispatch<SetStateAction<Array<string>>>;
	isLoading: boolean;
	className?: string;
}

function PureDocumentsInput({
	setDocumentsAction,
	setUploadQueueAction,
	isLoading,
	className,
}: DocumentsInputProps) {
	const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
	const [open, setOpen] = useState(false);

	// Fetch documents from your database
	useEffect(() => {
		let mounted = true;
		
		async function fetchDocuments() {
			try {
				const docs = await listAllDocuments();
				if (mounted) {
					// Remove any duplicates by ID
					const uniqueDocs = Array.from(
						new Map(docs.map(doc => [doc.id, doc])).values()
					);
					setDocuments(uniqueDocs);
				}
			} catch (error) {
				console.error('Failed to fetch documents:', error);
			}
		}

		fetchDocuments();
		return () => {
			mounted = false;
		};
	}, []);

	const handleDocumentSelected = (documentId: string) => {
		const selectedDoc = documents.find(doc => doc.id === documentId);
		if (selectedDoc) {
			setDocumentsAction(prev => [...prev, selectedDoc]);
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
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setOpen(prev => !prev);
				}}
				disabled={isLoading}
				type="button"
			>
				<FileIcon className="h-4 w-4" />
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

import type { DocumentAttachment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useRef } from "react";

interface DocumentPickerProps {
	documents: DocumentAttachment[];
	onDocumentSelected: (documentId: string) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

// SearchInput Component
function SearchInput({
	value,
	onChange
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
		}
	}, []);

	return (
		// biome-ignore lint/nursery/noStaticElementInteractions: <explanation>
		<input
			className="w-full px-2 py-1 mb-2 border rounded"
			placeholder="Search documents..."
			value={value}
			onChange={(e) => onChange(e.target.value)}
			autoFocus
			onKeyDown={handleKeyDown}
		/>
	);
}

// DocumentList Component
function DocumentList({
	documents,
	searchValue,
	onSelect
}: {
	documents: DocumentAttachment[];
	searchValue: string;
	onSelect: (documentId: string) => void;
}) {
	const filteredDocs = React.useMemo(() =>
		documents.filter(doc =>
			doc.title.toLowerCase().includes(searchValue.toLowerCase())
		),
		[documents, searchValue]
	);

	if (documents.length === 0) {
		return (
			<div className="text-sm text-gray-500 p-2">
				No documents found.
			</div>
		);
	}

	return (
		<div className="max-h-[300px] overflow-y-auto">
			{filteredDocs.map((document, index) => (
				<DocumentItem
					key={`doc-${document.id}-${index}`}
					document={document}
					isSelected={searchValue === document.title}
					onSelect={onSelect}
				/>
			))}
		</div>
	);
}

// DocumentItem Component
function DocumentItem({
	document,
	isSelected,
	onSelect
}: {
	document: DocumentAttachment;
	isSelected: boolean;
	onSelect: (documentId: string) => void;
}) {
	const handleClick = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onSelect(document.id);
	}, [document.id, onSelect]);

	return (
		<button
			className={cn(
				"flex items-center w-full px-2 py-1.5 text-sm rounded",
				"hover:bg-gray-100 focus:outline-none"
			)}
			onClick={handleClick}
			type="button"
		>
			<Check
				className={cn(
					"mr-2 h-4 w-4",
					isSelected ? "opacity-100" : "opacity-0"
				)}
			/>
			{document.title}
		</button>
	);
}

// Modal Component
function Modal({
	children,
	onClose
}: {
	children: React.ReactNode;
	onClose: () => void;
}) {
	const modalRef = useRef<HTMLDivElement>(null);

	const handleBackdropClick = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		if (!modalRef.current?.contains(e.target as Node)) {
			onClose();
		}
	}, [onClose]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [onClose]);

	return (
		// biome-ignore lint/nursery/noStaticElementInteractions: <explanation>
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
			onClick={handleBackdropClick}
		>
			{/* biome-ignore lint/nursery/noStaticElementInteractions: <explanation> */}
			<div
				ref={modalRef}
				className="bg-white rounded-lg shadow-lg w-[425px] max-h-[80vh] overflow-hidden relative z-10"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="p-4">
					{children}
				</div>
			</div>
		</div>
	);
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	{ hasError: boolean; error: Error | null }
> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error) {
		console.error("DocumentPicker Error:", error);
		return { hasError: true, error };
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-lg p-4">
						<h2>Something went wrong.</h2>
						<pre className="text-red-500">
							{this.state.error?.toString()}
						</pre>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Main DocumentPicker Component
function DocumentPickerContent({
	documents,
	onDocumentSelected,
	open,
	onOpenChange,
}: DocumentPickerProps) {
	const [searchValue, setSearchValue] = React.useState("");

	const handleDocumentSelect = useCallback((documentId: string) => {
		onDocumentSelected(documentId);
		onOpenChange(false);
	}, [onDocumentSelected, onOpenChange]);

	if (!open) return null;

	return (
		<Modal onClose={() => onOpenChange(false)}>
			<SearchInput
				value={searchValue}
				onChange={setSearchValue}
			/>
			<DocumentList
				documents={documents}
				searchValue={searchValue}
				onSelect={handleDocumentSelect}
			/>
		</Modal>
	);
}

// Exported Component with Error Boundary
export function DocumentPicker(props: DocumentPickerProps) {
	return (
		<ErrorBoundary>
			<DocumentPickerContent {...props} />
		</ErrorBoundary>
	);
}

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentAttachment } from "@/lib/types";

interface DocumentPickerProps {
	documents: DocumentAttachment[];
	onDocumentSelected: (documentId: string) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

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

function DocumentPickerContent({
	documents,
	onDocumentSelected,
	open,
	onOpenChange,
}: DocumentPickerProps) {
	const [value, setValue] = React.useState("");
	const modalRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onOpenChange(false);
			}
		};
		
		if (open) {
			document.addEventListener("keydown", handleEscape);
		}
		
		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [open, onOpenChange]);

	if (!open) return null;

	const handleBackdropClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!modalRef.current?.contains(e.target as Node)) {
			onOpenChange(false);
		}
	};

	const handleModalClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

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
				onClick={handleModalClick}
			>
				<div className="p-4">
					{/* biome-ignore lint/nursery/noStaticElementInteractions: <explanation> */}
					<input
						className="w-full px-2 py-1 mb-2 border rounded"
						placeholder="Search documents..."
						onChange={(e) => setValue(e.target.value)}
						autoFocus
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
							}
						}}
					/>
					{/* biome-ignore lint/nursery/noStaticElementInteractions: <explanation> */}
					<div 
						className="max-h-[300px] overflow-y-auto"
						onClick={(e) => e.stopPropagation()}
					>
						{documents.length === 0 ? (
							<div className="text-sm text-gray-500 p-2">
								No documents found.
							</div>
						) : (
							documents
								.filter(doc =>
									doc.title.toLowerCase().includes(value.toLowerCase())
								)
								.map((document, index) => (
									// biome-ignore lint/a11y/useButtonType: <explanation>
									<button
										key={`doc-${document.id}-${index}`}
										className={cn(
											"flex items-center w-full px-2 py-1.5 text-sm rounded",
											"hover:bg-gray-100 focus:outline-none"
										)}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											onDocumentSelected(document.id);
											onOpenChange(false);
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === document.title ?
													"opacity-100" : "opacity-0"
											)}
										/>
										{document.title}
									</button>
								))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export function DocumentPicker(props: DocumentPickerProps) {
	return (
		<ErrorBoundary>
			<DocumentPickerContent {...props} />
		</ErrorBoundary>
	);
}

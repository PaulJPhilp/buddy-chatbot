"use client"

import * as React from "react"

interface ExtendableDrawerProps {
	parentComponent: React.ComponentType<{ isDrawerOpen: boolean }> | React.ComponentType
	drawerComponent: React.ComponentType<{ isDrawerOpen: boolean }> | React.ComponentType
	maxHeight?: string
	maxWidth?: string
	className?: string
	children?: React.ReactNode
}

export function ExtendableDrawer({
	parentComponent: ParentComponent,
	drawerComponent: DrawerComponent,
	maxHeight = "50vh",
	maxWidth = "50vw",
	className = "",
	children,
}: ExtendableDrawerProps) {
	const [isOpen, setIsOpen] = React.useState(false)

	return (
		<>
			<div className="relative flex flex-col items-center w-full">
				<div className="relative w-full max-w-[500px]"> {/* Fixed max-width for the card */}
					<div className="w-full">
						<div className="flex flex-col gap-4 rounded-2xl p-4 skeleton-bg bg-indigo-900">
							<ParentComponent isDrawerOpen={isOpen} />
						</div>
					</div>

					{/* Handle - Added onClick handler */}
					{/* biome-ignore lint/nursery/noStaticElementInteractions: <explanation> */}
<div
						onClick={() => setIsOpen(!isOpen)}
						className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300 hover:bg-gray-400 cursor-pointer transition-colors duration-200 ease-in-out"
					>
						<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-1 bg-gray-500 rounded-full" />
					</div>

					{/* Drawer */}
					<div
						className={`absolute left-0 right-0 top-full overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px]" : "max-h-0"
							}`}
						style={{
							maxHeight: isOpen ? "500px" : 0,
						}}
					>
						<div className="bg-background border border-t-0 rounded-b-lg overflow-y-auto">
							{/* Drawer content */}
							<DrawerComponent isDrawerOpen={isOpen} />
							{children}
						</div>
					</div>
				</div>
			</div>


		</>
	)
}
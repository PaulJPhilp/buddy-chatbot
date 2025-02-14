"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const columns: ColumnDef<any>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Name
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "role",
		header: "Role",
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string
			return (
				<div
					className={`px-2 py-1 rounded-full text-xs inline-block
          ${status === "active" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}
				>
					{status.charAt(0).toUpperCase() + status.slice(1)}
				</div>
			)
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const user = row.original

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>Copy user ID</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>View user details</DropdownMenuItem>
						<DropdownMenuItem>Edit user</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		},
	},
]


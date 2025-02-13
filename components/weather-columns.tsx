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

import type { DailyWeather } from "./weather"

export const columns: ColumnDef<DailyWeather>[] = [
	{
		accessorKey: "date",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Day
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
	},
	{
		accessorKey: "min",
		header: "Min",
	},
	{
		accessorKey: "max",
		header: "Max",
	},
	{
		accessorKey: "sunrise",
		header: "Sunrise",
	},
	{
		accessorKey: "sunset",
		header: "Sunset",
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const weather = row.original

			if (!weather) {
				return null
			}

			const clipboardWeather =  weather

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
						<DropdownMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(clipboardWeather))}>Copy weather</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>View weather details</DropdownMenuItem>
						<DropdownMenuItem>Edit weather</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		},
	},
]
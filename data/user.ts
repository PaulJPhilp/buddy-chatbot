export type User = {
	id: string
	name: string
	email: string
	role: string
	status: "active" | "inactive"
}

export const users: User[] = [
	{
		id: "728ed52f",
		name: "John Doe",
		email: "john@example.com",
		role: "Admin",
		status: "active",
	},
	{
		id: "489e1d42",
		name: "Jane Smith",
		email: "jane@example.com",
		role: "User",
		status: "inactive",
	},
	{
		id: "573d2b1c",
		name: "Bob Johnson",
		email: "bob@example.com",
		role: "Editor",
		status: "active",
	},
	{
		id: "692c4a3e",
		name: "Alice Brown",
		email: "alice@example.com",
		role: "User",
		status: "active",
	},
	{
		id: "815f6b7a",
		name: "Charlie Davis",
		email: "charlie@example.com",
		role: "Moderator",
		status: "inactive",
	},
]


export const queryKeys = {
  boards: ["boards"] as const,
  board: (boardId: number) => ["boards", boardId] as const,
  assignedTasks: ["tasks", "assigned-to-me"] as const,
  reviewingTasks: ["tasks", "reviewing"] as const,
  comments: (taskId: number) => ["tasks", taskId, "comments"] as const,
  sessionRole: ["admin", "me"] as const,
  adminUsersAll: ["admin", "users"] as const,
  adminUsers: (search: string) => ["admin", "users", search] as const,
}

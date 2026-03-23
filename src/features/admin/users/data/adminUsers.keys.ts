import type { ListAdminUsersParams } from "../types/adminUsers.types";

export const adminUsersKeys = {
  all: ["admin", "users"] as const,
  lists: () => ["admin", "users", "list"] as const,
  list: (params: ListAdminUsersParams) =>
    ["admin", "users", "list", params] as const,
  details: () => ["admin", "users", "detail"] as const,
  detail: (id: string) => ["admin", "users", "detail", id] as const,
};
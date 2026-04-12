import type {
  ListTurnosMeParams,
  ListTurnosParams,
} from "../types/turnos.types";

export const turnosKeys = {
  all: ["turnos"] as const,
  lists: () => [...turnosKeys.all, "list"] as const,
  list: (params: ListTurnosParams) =>
    [...turnosKeys.all, "list", params] as const,
  meLists: () => [...turnosKeys.all, "me", "list"] as const,
  meList: (params: ListTurnosMeParams) =>
    [...turnosKeys.all, "me", "list", params] as const,
  meNext: () => [...turnosKeys.all, "me", "next"] as const,
  meActive: () => [...turnosKeys.all, "me", "active"] as const,
  details: () => [...turnosKeys.all, "detail"] as const,
  detail: (id: number) => [...turnosKeys.all, "detail", id] as const,
};

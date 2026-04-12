import type { ListRecaladasParams } from "../types/recaladas.types";

export const recaladasKeys = {
  all: ["recaladas"] as const,
  lists: () => [...recaladasKeys.all, "list"] as const,
  list: (params: ListRecaladasParams) =>
    [...recaladasKeys.all, "list", params] as const,
  details: () => [...recaladasKeys.all, "detail"] as const,
  detail: (id: number) => [...recaladasKeys.all, "detail", id] as const,
  atenciones: (id: number) =>
    [...recaladasKeys.all, "atenciones", id] as const,
};
